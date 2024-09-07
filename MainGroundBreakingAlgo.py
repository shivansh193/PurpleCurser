import requests
import time
from datetime import datetime, timedelta

API_KEY = ''
ETHERSCAN_API_URL = 'https://api.etherscan.io/api'

def get_transactions(wallet_address):
    url = f"{ETHERSCAN_API_URL}?module=account&action=txlist&address={wallet_address}&startblock=0&endblock=99999999&sort=asc&apikey={API_KEY}"
    response = requests.get(url)
    data = response.json()
    if data['status'] == '1':
        return data['result']
    else:
        return []

def has_outgoing_transactions(wallet_address):
    transactions = get_transactions(wallet_address)
    return any(tx['from'].lower() == wallet_address.lower() for tx in transactions)

def trace_funds(wallet_address, depth=0, max_depth=3, explored_wallets=None, endpoint_wallets=None):
    if explored_wallets is None:
        explored_wallets = set()
    if endpoint_wallets is None:
        endpoint_wallets = set()
    
    if wallet_address in explored_wallets or depth > max_depth or len(endpoint_wallets) >= 5:
        return endpoint_wallets
    
    explored_wallets.add(wallet_address)
    
    transactions = get_transactions(wallet_address)
    
    for tx in transactions:
        sender = tx['from'].lower()
        receiver = tx['to'].lower()
        
        if sender == wallet_address.lower():
            if not has_outgoing_transactions(receiver) and receiver not in endpoint_wallets:
                endpoint_wallets.add(receiver)
                if len(endpoint_wallets) >= 5:
                    return endpoint_wallets
            elif receiver not in explored_wallets:
                trace_funds(receiver, depth + 1, max_depth, explored_wallets, endpoint_wallets)
                if len(endpoint_wallets) >= 5:
                    return endpoint_wallets
    
    time.sleep(0.2)  # To avoid hitting API rate limits
    return endpoint_wallets

def get_account_balance(wallet_address):
    url = f"{ETHERSCAN_API_URL}?module=account&action=balance&address={wallet_address}&tag=latest&apikey={API_KEY}"
    response = requests.get(url)
    data = response.json()
    
    if data['status'] == '1':
        return int(data['result']) / 1e18  # Convert Wei to Ether
    else:
        return 0

def analyze_endpoint_wallets(endpoint_wallets):
    suspicious_wallets = []
    explored_wallets = []
    balances = []

    for wallet in endpoint_wallets:
        transactions = get_transactions(wallet)
        
        # Check for outgoing transactions
        if not any(tx['from'].lower() == wallet.lower() for tx in transactions):
            suspicious_wallets.append((wallet, "No outgoing transactions"))
        else:
            explored_wallets.append(wallet)
        
        # Improved transaction volume check
        if transactions:
            # Sort transactions by timestamp
            sorted_transactions = sorted(transactions, key=lambda x: int(x['timeStamp']))
            
            # Get the timestamp of the first and last transaction
            first_tx_time = datetime.fromtimestamp(int(sorted_transactions[0]['timeStamp']))
            last_tx_time = datetime.fromtimestamp(int(sorted_transactions[-1]['timeStamp']))
            
            # Calculate the age of the wallet in days
            wallet_age_days = (last_tx_time - first_tx_time).days + 1  # Add 1 to avoid division by zero
            
            # Calculate transactions per day
            tx_per_day = len(transactions) / wallet_age_days
            
            # Check if the transaction volume is suspiciously high
            if tx_per_day > 10 and len(transactions) > 100:  # Adjust these thresholds as needed
                suspicious_wallets.append((wallet, f"High transaction volume: {tx_per_day:.2f} tx/day"))
        
        # Get account balance
        balance = get_account_balance(wallet)
        balances.append(balance)
        
        time.sleep(0.2)  # To avoid hitting API rate limits

    # Check for wallets with considerably higher balance
    if balances:
        avg_balance = sum(balances) / len(balances)
        for wallet, balance in zip(endpoint_wallets, balances):
            if balance > avg_balance * 3:  # Adjust this threshold as needed
                suspicious_wallets.append((wallet, f"Significantly higher balance: {balance:.2f} ETH"))

    return suspicious_wallets, explored_wallets

if __name__ == "__main__":
    start_wallet = '0xFbE05Bade437FD9aD841431dDb64b25276882c26'
    
    endpoint_wallets = trace_funds(start_wallet)
    print(f"Found {len(endpoint_wallets)} unique endpoint wallets:")
    for wallet in endpoint_wallets:
        print(f"- {wallet}")
    
    suspicious_wallets, explored_wallets = analyze_endpoint_wallets(endpoint_wallets)
    
    if suspicious_wallets:
        print("\nSuspicious wallet addresses found:")
        for wallet, reason in suspicious_wallets:
            print(f"- {wallet}: {reason}")
    else:
        print("\nNo suspicious addresses found.")
    
    print("\nAnalysis complete. Program ending.")
