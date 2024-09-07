import requests
import time
from datetime import datetime
from collections import deque
import statistics
import json

API_KEY = '55KKDRGTSCHDCYU14T48EDYJSASRNQNW8U'
ETHERSCAN_API_URL = 'https://api.etherscan.io/api'

MIXER_ADDRESSES = {
    '0x1234567890123456789012345678901234567890',
    '0x0987654321098765432109876543210987654321',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    '0xfedcfedcfedcfedcfedcfedcfedcfedcfedcfedc',
    '0x00112233445566778899aabbccddeeff00112233'
}

API_CALLS = deque(maxlen=5)

def rate_limit():
    now = time.time()
    if len(API_CALLS) == 5:
        if now - API_CALLS[0] < 1.1:
            time.sleep(1.1 - (now - API_CALLS[0]))
    API_CALLS.append(time.time())

def api_request(url):
    rate_limit()
    response = requests.get(url)
    return response.json()

def get_transactions(wallet_address):
    url = f"{ETHERSCAN_API_URL}?module=account&action=txlist&address={wallet_address}&startblock=0&endblock=99999999&sort=asc&apikey={API_KEY}"
    data = api_request(url)
    if data['status'] == '1':
        return data['result']
    else:
        return []

def has_outgoing_transactions(wallet_address):
    transactions = get_transactions(wallet_address)
    return any(tx['from'].lower() == wallet_address.lower() for tx in transactions)

def trace_funds(wallet_address, depth=0, max_depth=3, explored_wallets=None, endpoint_wallets=None, transactions=None):
    if explored_wallets is None:
        explored_wallets = set()
    if endpoint_wallets is None:
        endpoint_wallets = set()
    if transactions is None:
        transactions = []

    if wallet_address in explored_wallets or depth > max_depth or len(endpoint_wallets) >= 5:
        return endpoint_wallets, transactions

    explored_wallets.add(wallet_address)
    
    wallet_transactions = get_transactions(wallet_address)

    for tx in wallet_transactions:
        sender = tx['from'].lower()
        receiver = tx['to'].lower()

        if receiver in MIXER_ADDRESSES or sender in MIXER_ADDRESSES:
            endpoint_wallets.add(receiver)
            endpoint_wallets.add(sender)
            transactions.append(tx)
            return endpoint_wallets, transactions

        if sender == wallet_address.lower():
            transactions.append(tx)
            if not has_outgoing_transactions(receiver) and receiver not in endpoint_wallets:
                endpoint_wallets.add(receiver)
                if len(endpoint_wallets) >= 5:
                    return endpoint_wallets, transactions
            elif receiver not in explored_wallets:
                endpoint_wallets, transactions = trace_funds(receiver, depth + 1, max_depth, explored_wallets, endpoint_wallets, transactions)
                if len(endpoint_wallets) >= 5:
                    return endpoint_wallets, transactions
    
    return endpoint_wallets, transactions

def get_account_balance(wallet_address):
    url = f"{ETHERSCAN_API_URL}?module=account&action=balance&address={wallet_address}&tag=latest&apikey={API_KEY}"
    data = api_request(url)
    
    if data['status'] == '1':
        return int(data['result']) / 1e18  # Convert Wei to Ether
    else:
        return 0

def perform_temporal_analysis(transactions):
    if not transactions:
        return 0, []

    sorted_transactions = sorted(transactions, key=lambda x: int(x['timeStamp']))
    time_diffs = []
    suspicious_patterns = []
    score = 0

    for i in range(1, len(sorted_transactions)):
        time_diff = int(sorted_transactions[i]['timeStamp']) - int(sorted_transactions[i-1]['timeStamp'])
        time_diffs.append(time_diff)

    if not time_diffs:
        return 0, []

    avg_time_diff = statistics.mean(time_diffs)
    std_time_diff = statistics.stdev(time_diffs) if len(time_diffs) > 1 else 0

    if std_time_diff < avg_time_diff * 0.1:
        score += 20
        suspicious_patterns.append("Unusually regular time intervals between transactions")

    burst_threshold = avg_time_diff * 0.1
    bursts = sum(1 for diff in time_diffs if diff < burst_threshold)
    if bursts > len(time_diffs) * 0.3:
        score += 15
        suspicious_patterns.append(f"Bursts of activity detected ({bursts} rapid transactions)")

    long_inactivity = avg_time_diff * 10
    for i, diff in enumerate(time_diffs):
        if diff > long_inactivity and i < len(time_diffs) - 1 and time_diffs[i+1] < burst_threshold:
            score += 10
            suspicious_patterns.append("Long inactivity followed by sudden burst")
            break

    cycle_length = 24 * 60 * 60  
    cycle_counts = [0] * 24
    for tx in sorted_transactions:
        hour = datetime.fromtimestamp(int(tx['timeStamp'])).hour
        cycle_counts[hour] += 1
    
    if max(cycle_counts) > sum(cycle_counts) * 0.5:
        score += 15
        suspicious_patterns.append(f"Strong cyclical pattern detected (peak at hour {cycle_counts.index(max(cycle_counts))})")

    suspicious_hours = sum(1 for tx in sorted_transactions if 2 <= datetime.fromtimestamp(int(tx['timeStamp'])).hour < 5)
    if suspicious_hours > len(sorted_transactions) * 0.3:
        score += 10
        suspicious_patterns.append(f"High proportion of transactions at suspicious hours ({suspicious_hours} transactions)")

    return score, suspicious_patterns

def analyze_endpoint_wallets(endpoint_wallets):
    suspicious_wallets = []
    explored_wallets = []
    balances = []
    wallet_scores = {}

    for wallet in endpoint_wallets:
        transactions = get_transactions(wallet)
        score = 0
        reasons = []
        
        if not transactions:
            wallet_scores[wallet] = 0
            continue

        temporal_score, temporal_patterns = perform_temporal_analysis(transactions)
        score += temporal_score
        reasons.extend(temporal_patterns)

        sorted_transactions = sorted(transactions, key=lambda x: int(x['timeStamp']))
        first_tx_time = datetime.fromtimestamp(int(sorted_transactions[0]['timeStamp']))
        last_tx_time = datetime.fromtimestamp(int(sorted_transactions[-1]['timeStamp']))
        wallet_age_days = max((last_tx_time - first_tx_time).days, 1)
        tx_per_day = len(transactions) / wallet_age_days
        
        if tx_per_day > 50:
            score += min(int(tx_per_day), 30)
            reasons.append(f"Extremely high transaction volume: {tx_per_day:.2f} tx/day")
        elif tx_per_day > 10:
            score += min(int(tx_per_day / 2), 15)
            reasons.append(f"High transaction volume: {tx_per_day:.2f} tx/day")

        outgoing_tx = sum(1 for tx in transactions if tx['from'].lower() == wallet.lower())
        if outgoing_tx == 0:
            score += 25
            reasons.append("No outgoing transactions")
        elif outgoing_tx / len(transactions) < 0.1:
            score += 15
            reasons.append("Very low proportion of outgoing transactions")

        round_number_txs = sum(1 for tx in transactions if float(tx['value']) / 1e18 % 1 == 0)
        round_number_ratio = round_number_txs / len(transactions)
        if round_number_ratio > 0.7:
            score += 20
            reasons.append(f"Very high proportion of round number transactions: {round_number_ratio:.2f}")
        elif round_number_ratio > 0.5:
            score += 10
            reasons.append(f"High proportion of round number transactions: {round_number_ratio:.2f}")

        unusual_hour_txs = sum(1 for tx in transactions if 1 <= datetime.fromtimestamp(int(tx['timeStamp'])).hour < 5)
        unusual_hour_ratio = unusual_hour_txs / len(transactions)
        if unusual_hour_ratio > 0.5:
            score += 20
            reasons.append(f"Very high proportion of transactions at unusual hours: {unusual_hour_ratio:.2f}")
        elif unusual_hour_ratio > 0.3:
            score += 10
            reasons.append(f"High proportion of transactions at unusual hours: {unusual_hour_ratio:.2f}")

        balance = get_account_balance(wallet)
        balances.append(balance)

        if score >= 50:
            suspicious_wallets.append({
                'wallet': wallet,
                'score': score,
                'reasons': reasons
            })

        wallet_scores[wallet] = score
        explored_wallets.append({
            'wallet': wallet,
            'balance': balance,
            'reasons': reasons,
            'score': score
        })

    avg_balance = sum(balances) / len(balances) if balances else 0
    return suspicious_wallets, avg_balance, explored_wallets

def main(wallet_address):
    endpoint_wallets, transactions = trace_funds(wallet_address)
    suspicious_wallets, avg_balance, explored_wallets = analyze_endpoint_wallets(endpoint_wallets)

    result = {
        "wallet_address": wallet_address,
        "endpoint_wallets": list(endpoint_wallets),
        "suspicious_wallets": suspicious_wallets,
        "average_balance": avg_balance,
        "explored_wallets": explored_wallets,
        "transactions": transactions
    }

    # Output the results in JSON format
    print(json.dumps(result, indent=4))

if __name__ == "__main__":
    wallet_address = '0xFbE05Bade437FD9aD841431dDb64b25276882c26'
    main(wallet_address)