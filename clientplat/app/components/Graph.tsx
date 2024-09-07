"use client"
import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Define types for our data
interface Wallet {
  wallet: string;
  balance: number;
  reasons: string[];
  score: number;
}

interface TransactionData {
  wallet_address: string;
  endpoint_wallets: string[];
  suspicious_wallets: Wallet[];
  average_balance: number;
  explored_wallets: Wallet[];
}
// Mock data (replace with actual API call when ready)
const data = 
{
    "wallet_address": "0xFbE05Bade437FD9aD841431dDb64b25276882c26",
    "endpoint_wallets": [
        "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        "0x514910771af9ca656af840dff83e8264ecf986ca",
        "0x6ff73602b0bb13bc9093909a1bde304987fcdf95"
    ],
    "suspicious_wallets": [
        {
            "wallet": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "score": 85,
            "reasons": [
                "Bursts of activity detected (3203 rapid transactions)",
                "Long inactivity followed by sudden burst",
                "High transaction volume: 46.95 tx/day",
                "No outgoing transactions",
                "Very high proportion of round number transactions: 1.00"
            ]
        },
        {
            "wallet": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "score": 100,
            "reasons": [
                "Bursts of activity detected (4707 rapid transactions)",
                "Long inactivity followed by sudden burst",
                "Extremely high transaction volume: 90.09 tx/day",
                "No outgoing transactions",
                "Very high proportion of round number transactions: 1.00"
            ]
        },
        {
            "wallet": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            "score": 115,
            "reasons": [
                "Bursts of activity detected (9437 rapid transactions)",
                "Long inactivity followed by sudden burst",
                "Strong cyclical pattern detected (peak at hour 7)",
                "Extremely high transaction volume: 5000.00 tx/day",
                "No outgoing transactions",
                "Very high proportion of round number transactions: 1.00"
            ]
        },
        {
            "wallet": "0x514910771af9ca656af840dff83e8264ecf986ca",
            "score": 100,
            "reasons": [
                "Bursts of activity detected (5603 rapid transactions)",
                "Long inactivity followed by sudden burst",
                "Extremely high transaction volume: 1250.00 tx/day",
                "No outgoing transactions",
                "Very high proportion of round number transactions: 1.00"
            ]
        },
        {
            "wallet": "0x6ff73602b0bb13bc9093909a1bde304987fcdf95",
            "score": 60,
            "reasons": [
                "Bursts of activity detected (1342 rapid transactions)",
                "Long inactivity followed by sudden burst",
                "No outgoing transactions",
                "High proportion of transactions at unusual hours: 0.32"
            ]
        }
    ],
    "average_balance": 2.0000000000000002e-19,
    "explored_wallets": [
        {
            "wallet": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "balance": 1e-18,
            "reasons": [
                "Bursts of activity detected (3203 rapid transactions)",
                "Long inactivity followed by sudden burst",
                "High transaction volume: 46.95 tx/day",
                "No outgoing transactions",
                "Very high proportion of round number transactions: 1.00"
            ],
            "score": 85
        },
        {
            "wallet": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "balance": 0.0,
            "reasons": [
                "Bursts of activity detected (4707 rapid transactions)",
                "Long inactivity followed by sudden burst",
                "Extremely high transaction volume: 90.09 tx/day",
                "No outgoing transactions",
                "Very high proportion of round number transactions: 1.00"
            ],
            "score": 100
        },
        {
            "wallet": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            "balance": 0.0,
            "reasons": [
                "Bursts of activity detected (9437 rapid transactions)",
                "Long inactivity followed by sudden burst",
                "Strong cyclical pattern detected (peak at hour 7)",
                "Extremely high transaction volume: 5000.00 tx/day",
                "No outgoing transactions",
                "Very high proportion of round number transactions: 1.00"
            ],
            "score": 115
        },
        {
            "wallet": "0x514910771af9ca656af840dff83e8264ecf986ca",
            "balance": 0.0,
            "reasons": [
                "Bursts of activity detected (5603 rapid transactions)",
                "Long inactivity followed by sudden burst",
                "Extremely high transaction volume: 1250.00 tx/day",
                "No outgoing transactions",
                "Very high proportion of round number transactions: 1.00"
            ],
            "score": 100
        },
        {
            "wallet": "0x6ff73602b0bb13bc9093909a1bde304987fcdf95",
            "balance": 0.0,
            "reasons": [
                "Bursts of activity detected (1342 rapid transactions)",
                "Long inactivity followed by sudden burst",
                "No outgoing transactions",
                "High proportion of transactions at unusual hours: 0.32"
            ],
            "score": 60
        }
    ],
    "transactions": [
        {
            "blockNumber": "17469922",
            "blockHash": "0xfdd65aa2b143934bc90a423cb4b4e087a656f769f04e0d7d42faabb956881c9a",
            "timeStamp": "1686645359",
            "hash": "0xecfc2824f5a9cc3edd621696209e8d9b7aa342cb2354996c3a742ead0874631b",
            "nonce": "0",
            "transactionIndex": "16",
            "from": "0xfbe05bade437fd9ad841431ddb64b25276882c26",
            "to": "0xe5b1f760ba4334bc311695e125861eb5870018ad",
            "value": "180812771488060182000",
            "gas": "21000",
            "gasPrice": "16582669162",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "1865501",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "3225277",
            "isError": "0"
        },
        {
            "blockNumber": "16483225",
            "blockHash": "0xb0c29d211d0fa8847e5216821a7f3716b5c65c2717e3c9acee8b1c53eec45e2d",
            "timeStamp": "1674642335",
            "hash": "0xfad40f99ffdaf1681c3e084de05c3b686e93d551a93aaf29647e732cd857e910",
            "nonce": "0",
            "transactionIndex": "1",
            "from": "0xe5b1f760ba4334bc311695e125861eb5870018ad",
            "to": "0xd8b483d51dffce4a296aa4bf09337f8cf55cb052",
            "value": "34177260000000000",
            "gas": "60000",
            "gasPrice": "26000000000",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "42512",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "4211974",
            "isError": "0"
        },
        {
            "blockNumber": "16483166",
            "timeStamp": "1674641627",
            "hash": "0xc3fbbb53787923e7ec14cf3742c8b4edb803d3f98bab0d7190169936977e699c",
            "nonce": "0",
            "blockHash": "0x7a5e0531d49ff48bb66454c8257382ddf115a7325fc2a779230372aa75a561b4",
            "transactionIndex": "135",
            "from": "0xd8b483d51dffce4a296aa4bf09337f8cf55cb052",
            "to": "0xe5b1f760ba4334bc311695e125861eb5870018ad",
            "value": "68727430000000000",
            "gas": "21000",
            "gasPrice": "13000000000",
            "isError": "0",
            "txreceipt_status": "1",
            "input": "0x",
            "contractAddress": "",
            "cumulativeGasUsed": "18973755",
            "gasUsed": "21000",
            "confirmations": "4212034",
            "methodId": "0x",
            "functionName": ""
        },
        {
            "blockNumber": "16483542",
            "timeStamp": "1674646163",
            "hash": "0x008ee48eceb17c95a310f66b698dce87529ed7056438343da169b92a9412ab7f",
            "nonce": "1",
            "blockHash": "0x855d58cc46eac0b298e664a2bca64460e5143918fa3a0d425190d2a87ee0fe0b",
            "transactionIndex": "81",
            "from": "0xd8b483d51dffce4a296aa4bf09337f8cf55cb052",
            "to": "0xe5b1f760ba4334bc311695e125861eb5870018ad",
            "value": "33883260000000000",
            "gas": "21000",
            "gasPrice": "14000000000",
            "isError": "0",
            "txreceipt_status": "1",
            "input": "0x",
            "contractAddress": "",
            "cumulativeGasUsed": "29976335",
            "gasUsed": "21000",
            "confirmations": "4211658",
            "methodId": "0x",
            "functionName": ""
        },
        {
            "blockNumber": "16483613",
            "timeStamp": "1674647015",
            "hash": "0x3826ebdfea8e182ea3b41214c8e73eff4a18e658eefffa44646d9eed1a19561d",
            "nonce": "2",
            "blockHash": "0x960303945ba1031fe4bda3597dc82c58aeb4a57654f60ce2c499ed98b85575b8",
            "transactionIndex": "145",
            "from": "0xd8b483d51dffce4a296aa4bf09337f8cf55cb052",
            "to": "0xe5b1f760ba4334bc311695e125861eb5870018ad",
            "value": "7010754497399010",
            "gas": "21000",
            "gasPrice": "13000000000",
            "isError": "0",
            "txreceipt_status": "1",
            "input": "0x",
            "contractAddress": "",
            "cumulativeGasUsed": "12559952",
            "gasUsed": "21000",
            "confirmations": "4211587",
            "methodId": "0x",
            "functionName": ""
        },
        {
            "blockNumber": "16483860",
            "timeStamp": "1674650015",
            "hash": "0xd9f58bf22f305130c0388803976aa5e7258026ca5f7f252cbe24630a88e80bba",
            "nonce": "3",
            "blockHash": "0xc2ba8ad6e70845eadd6f3cfc431e90600f37b6401cbe90a5b1fb3030c67839d2",
            "transactionIndex": "81",
            "from": "0xd8b483d51dffce4a296aa4bf09337f8cf55cb052",
            "to": "0xe5b1f760ba4334bc311695e125861eb5870018ad",
            "value": "38412381358122123",
            "gas": "21000",
            "gasPrice": "16000000000",
            "isError": "0",
            "txreceipt_status": "1",
            "input": "0x",
            "contractAddress": "",
            "cumulativeGasUsed": "6107095",
            "gasUsed": "21000",
            "confirmations": "4211340",
            "methodId": "0x",
            "functionName": ""
        },
        {
            "blockNumber": "16484378",
            "timeStamp": "1674656279",
            "hash": "0xec3ec849b60f158e6b6b58a0be43a38eaaed83007c2c48d372e38518a8f82a85",
            "nonce": "4",
            "blockHash": "0x6f8722292d25e77a78c4f6df4ba970a1dcedf8765a9b1d80af7aa414da54bc34",
            "transactionIndex": "8",
            "from": "0xd8b483d51dffce4a296aa4bf09337f8cf55cb052",
            "to": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            "value": "0",
            "gas": "57194",
            "gasPrice": "20000000000",
            "isError": "0",
            "txreceipt_status": "1",
            "input": "0xa9059cbb000000000000000000000000e5b1f760ba4334bc311695e125861eb5870018ad0000000000000000000000000000000000000000000000005830527f15cf4800",
            "contractAddress": "",
            "cumulativeGasUsed": "504820",
            "gasUsed": "52394",
            "confirmations": "4210822",
            "methodId": "0xa9059cbb",
            "functionName": "transfer(address _to, uint256 _value)"
        },
        {
            "blockNumber": "16490196",
            "timeStamp": "1674726539",
            "hash": "0xcd8d905c115aac31936861ab1454d134ab9ececd8f4accd3e933b5d17bf36d98",
            "nonce": "5",
            "blockHash": "0x1112265a89b7a497cd7699cd399730761fe5820d6edf3b848f4fd158746868c9",
            "transactionIndex": "93",
            "from": "0xd8b483d51dffce4a296aa4bf09337f8cf55cb052",
            "to": "0x89630c026195481181a172dc60d6fac4d6eac76d",
            "value": "48000000000000000",
            "gas": "21000",
            "gasPrice": "15000000000",
            "isError": "0",
            "txreceipt_status": "1",
            "input": "0x",
            "contractAddress": "",
            "cumulativeGasUsed": "8082815",
            "gasUsed": "21000",
            "confirmations": "4205004",
            "methodId": "0x",
            "functionName": ""
        },
        {
            "blockNumber": "16490601",
            "blockHash": "0x3ac06ebe4a3dfd2497d54dcb89b63eab508cd788dc9878b2ff2f54a69cfa3dbe",
            "timeStamp": "1674731411",
            "hash": "0xefa1e04acce98674a8cb36606880f6ac2618c66e620e5f80e2d05a4281b8683e",
            "nonce": "0",
            "transactionIndex": "113",
            "from": "0x89630c026195481181a172dc60d6fac4d6eac76d",
            "to": "0x9d96b0561be0440ebe93e79fe06a23bbe8270f90",
            "value": "47570000000000000",
            "gas": "21000",
            "gasPrice": "14029426370",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "12353795",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "4204600",
            "isError": "0"
        },
        {
            "blockNumber": "16982037",
            "timeStamp": "1680691115",
            "hash": "0xe2a919faa8b2b0c3e51904c1e1788a786fce32014e89555573e6d07ad1d5a2a9",
            "nonce": "6",
            "blockHash": "0x5310a3be4924051167cbc599cd694c7d7cc47e0f606b6d4f3dc48ad200f88344",
            "transactionIndex": "138",
            "from": "0xd8b483d51dffce4a296aa4bf09337f8cf55cb052",
            "to": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            "value": "0",
            "gas": "40106",
            "gasPrice": "24000000000",
            "isError": "0",
            "txreceipt_status": "1",
            "input": "0xa9059cbb0000000000000000000000000ac397cdbcd7a0627035c9608bc8940a89e6fddc000000000000000000000000000000000000000000000000583051c97a2fd000",
            "contractAddress": "",
            "cumulativeGasUsed": "10489156",
            "gasUsed": "35306",
            "confirmations": "3713163",
            "methodId": "0xa9059cbb",
            "functionName": "transfer(address _to, uint256 _value)"
        },
        {
            "blockNumber": "16982315",
            "timeStamp": "1680694499",
            "hash": "0xa3479b492b449433a3408956aa46f4e727b47c9e3481b94f9e86ebf979658a8e",
            "nonce": "7",
            "blockHash": "0xc659a0c75a372e2b28f7bc2bc13145973e95e9dbb25d79928cbe16a078c663c9",
            "transactionIndex": "196",
            "from": "0xd8b483d51dffce4a296aa4bf09337f8cf55cb052",
            "to": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "value": "5081890144478867",
            "gas": "21000",
            "gasPrice": "25000000000",
            "isError": "0",
            "txreceipt_status": "1",
            "input": "0x",
            "contractAddress": "",
            "cumulativeGasUsed": "23429958",
            "gasUsed": "21000",
            "confirmations": "3712885",
            "methodId": "0x",
            "functionName": ""
        },
        {
            "blockNumber": "14120984",
            "blockHash": "0x47abd2bb278765fd16787a90482133b31dfecfc6c7f79a97b1bffb94bdc967cd",
            "timeStamp": "1643730311",
            "hash": "0xbc990bba7f00995c4ba0b8ef232d4a373a68b534b96b8fa21a645761b051c74c",
            "nonce": "0",
            "transactionIndex": "72",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0x6ff73602b0bb13bc9093909a1bde304987fcdf95",
            "value": "7000000000",
            "gas": "21000",
            "gasPrice": "153000000000",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "3351965",
            "txreceipt_status": "0",
            "gasUsed": "21000",
            "confirmations": "6574220",
            "isError": "1"
        },
        {
            "blockNumber": "14121016",
            "blockHash": "0x9ee1b0808a6d01f4ff1ab5891271e6aaae1c51434da7746c947b4e1cac3e765c",
            "timeStamp": "1643730754",
            "hash": "0xa74ed6127e806dcfc48912e1f36b0cb7dea18d0a285929afa81ea0d6a011da91",
            "nonce": "1",
            "transactionIndex": "120",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0x6ff73602b0bb13bc9093909a1bde304987fcdf95",
            "value": "6500000000",
            "gas": "47286",
            "gasPrice": "118000000000",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "6364702",
            "txreceipt_status": "1",
            "gasUsed": "39405",
            "confirmations": "6574188",
            "isError": "0"
        },
        {
            "blockNumber": "14158117",
            "blockHash": "0x40aa321de8b53a2b0a76c3c06c0c25a75af3aeb5b3a853f6b7c525133f3c3fab",
            "timeStamp": "1644225980",
            "hash": "0x5a58539fb0611f88d5d391aa3a643da6410a99e659921c4314b5f3c15e162dd1",
            "nonce": "2",
            "transactionIndex": "54",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0x6ff73602b0bb13bc9093909a1bde304987fcdf95",
            "value": "19083540000000000",
            "gas": "47286",
            "gasPrice": "63400000000",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "7219215",
            "txreceipt_status": "1",
            "gasUsed": "39405",
            "confirmations": "6537087",
            "isError": "0"
        },
        {
            "blockNumber": "14158605",
            "blockHash": "0x2c44c59bf52c04eea1570783f4e26eff4550cae335f1de51f77049f24de8fe58",
            "timeStamp": "1644232616",
            "hash": "0xdf92324d8f10ee929d760eadf703b29810663905301d7640b535b9e18c179640",
            "nonce": "3",
            "transactionIndex": "756",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0x6ff73602b0bb13bc9093909a1bde304987fcdf95",
            "value": "19009930000000000",
            "gas": "47286",
            "gasPrice": "55800000000",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "23133111",
            "txreceipt_status": "1",
            "gasUsed": "39405",
            "confirmations": "6536599",
            "isError": "0"
        },
        {
            "blockNumber": "14163941",
            "blockHash": "0xe6048ce1fff1337dd1eb2d238745881add94f54d014755a94ce39db93549287e",
            "timeStamp": "1644303245",
            "hash": "0x61f7e86abbeb206508b07e553f7fb9d4b540d7342b2d43298d05cf3ab10da6cb",
            "nonce": "4",
            "transactionIndex": "163",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0x6ff73602b0bb13bc9093909a1bde304987fcdf95",
            "value": "18973610000000000",
            "gas": "47286",
            "gasPrice": "51000000000",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "10972454",
            "txreceipt_status": "1",
            "gasUsed": "39405",
            "confirmations": "6531263",
            "isError": "0"
        },
        {
            "blockNumber": "14183847",
            "blockHash": "0x76a9f2466e1fde4fbc523bdf52f4209ec2899379acab403a487ee6b44662a7ee",
            "timeStamp": "1644570539",
            "hash": "0x9362acce3484ac0b49bd76545e7633cb8d86afaaa53da2ead599aad5103bd7f7",
            "nonce": "5",
            "transactionIndex": "85",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0x6ff73602b0bb13bc9093909a1bde304987fcdf95",
            "value": "18954800000000000",
            "gas": "47286",
            "gasPrice": "43800000000",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "4546345",
            "txreceipt_status": "1",
            "gasUsed": "39405",
            "confirmations": "6511357",
            "isError": "0"
        },
        {
            "blockNumber": "14183867",
            "blockHash": "0x91af034d607c7cb30cc2639fd8e1fdb36520ac8e7ca753601405d4a1ef1e9b75",
            "timeStamp": "1644570737",
            "hash": "0xe7998cdc5befeb44c321fab680018437b165b8c33cd87d1b701bea69714e52f0",
            "nonce": "6",
            "transactionIndex": "107",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0x6ff73602b0bb13bc9093909a1bde304987fcdf95",
            "value": "18943030000000000",
            "gas": "47286",
            "gasPrice": "42600000000",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "6995673",
            "txreceipt_status": "1",
            "gasUsed": "39405",
            "confirmations": "6511337",
            "isError": "0"
        },
        {
            "blockNumber": "15127629",
            "blockHash": "0xf61428ee72288bb0d095aee5a8ec4066fa8f1dea5929f579a2ca1fa97b1fd4ef",
            "timeStamp": "1657626448",
            "hash": "0x918e8efe7a7f0743a978065480e9ab1e41b432f57c0b000fd3583604b9d755e2",
            "nonce": "7",
            "transactionIndex": "60",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0x665b9e565bed2ac612b0c2170ec7e2f62948d259",
            "value": "33668740500000000",
            "gas": "21000",
            "gasPrice": "14650000000",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "5116115",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "5567575",
            "isError": "0"
        },
        {
            "blockNumber": "15135115",
            "blockHash": "0x76adaf37ead12630e6d221335152e7e6514d5c191576dac0eb1fa59d5bb6b19b",
            "timeStamp": "1657727105",
            "hash": "0xfc41c1d3563ddd64b0de05b0fe3257b56316859f06d2f11911faa932b961d2a5",
            "nonce": "8",
            "transactionIndex": "51",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "value": "0",
            "gas": "55316",
            "gasPrice": "25200000000",
            "input": "0xa9059cbb000000000000000000000000a396be032159b3bcb04114fe45a800d1bcfd5c3e00000000000000000000000000000000000000000000000000000000136da232",
            "methodId": "0xa9059cbb",
            "functionName": "transfer(address _to, uint256 _value)",
            "contractAddress": "",
            "cumulativeGasUsed": "6763658",
            "txreceipt_status": "1",
            "gasUsed": "41297",
            "confirmations": "5560089",
            "isError": "0"
        },
        {
            "blockNumber": "15483201",
            "blockHash": "0xe3a156c556581c6ee448b12cc81ac136a505c929eea77b1877e490865dcd1c2f",
            "timeStamp": "1662455616",
            "hash": "0x733f1ff07cd90fc789b849bcd1177a440caf05134d2c326fdbb86606a2213de2",
            "nonce": "9",
            "transactionIndex": "34",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0x514910771af9ca656af840dff83e8264ecf986ca",
            "value": "0",
            "gas": "62492",
            "gasPrice": "11900000000",
            "input": "0xa9059cbb0000000000000000000000006ff73602b0bb13bc9093909a1bde304987fcdf950000000000000000000000000000000000000000000000004894b14a4f4b0000",
            "methodId": "0xa9059cbb",
            "functionName": "transfer(address _to, uint256 _value)",
            "contractAddress": "",
            "cumulativeGasUsed": "1746273",
            "txreceipt_status": "1",
            "gasUsed": "52077",
            "confirmations": "5212003",
            "isError": "0"
        },
        {
            "blockNumber": "15490914",
            "blockHash": "0xd93335542668e4770b78fff7e890c4fe6e071ba524742ab0e7ac080ea3adcac0",
            "timeStamp": "1662562178",
            "hash": "0xc82810b813247d04fb6c7bb6a2ad0658a70759938ce3b0f9104fda7cbda7d30a",
            "nonce": "10",
            "transactionIndex": "104",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            "value": "0",
            "gas": "68647",
            "gasPrice": "58100000000",
            "input": "0xa9059cbb0000000000000000000000006ff73602b0bb13bc9093909a1bde304987fcdf95000000000000000000000000000000000000000000000000474b226ca7033400",
            "methodId": "0xa9059cbb",
            "functionName": "transfer(address _to, uint256 _value)",
            "contractAddress": "",
            "cumulativeGasUsed": "5737954",
            "txreceipt_status": "1",
            "gasUsed": "57206",
            "confirmations": "5204290",
            "isError": "0"
        },
        {
            "blockNumber": "17187092",
            "blockHash": "0xedcb67d61083151c8a7e20fa8046443df6b2bb4e0a7a275c2502dafa82d1a999",
            "timeStamp": "1683200711",
            "hash": "0x11a45cce5490e117d696117c77c154885cf4f1044b4d7a93dfcb75167d54c3d2",
            "nonce": "11",
            "transactionIndex": "136",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "value": "0",
            "gas": "75851",
            "gasPrice": "65304628027",
            "input": "0xa9059cbb0000000000000000000000006ff73602b0bb13bc9093909a1bde304987fcdf95000000000000000000000000000000000000000000000000000000000496ed40",
            "methodId": "0xa9059cbb",
            "functionName": "transfer(address _to, uint256 _value)",
            "contractAddress": "",
            "cumulativeGasUsed": "9530363",
            "txreceipt_status": "1",
            "gasUsed": "63209",
            "confirmations": "3508112",
            "isError": "0"
        },
        {
            "blockNumber": "17228727",
            "blockHash": "0xfdaceadcee6505d11bf964bb8b06857e48756f92915538ad3abc26a6a6fce786",
            "timeStamp": "1683706163",
            "hash": "0x0279b640b3a3a34c036000feb923dfb3526213e04c2864d1ae737eb8bf11c3f9",
            "nonce": "12",
            "transactionIndex": "81",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0x43f53860eef53bfed29e17a04f53a860e69d4c5c",
            "value": "5365638451357507",
            "gas": "21000",
            "gasPrice": "53004749010",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "8161598",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "3466477",
            "isError": "0"
        },
        {
            "blockNumber": "17335251",
            "blockHash": "0x5c2bbd2d13f0e4eefc438cb2be6dc2ada6f3ae5b302de9fc84ac1bbc4a13f392",
            "timeStamp": "1685006627",
            "hash": "0xa38d69529a8dc110d655c6dcb8e6a572b1590297ea226143c93b7837b2f987ac",
            "nonce": "13",
            "transactionIndex": "21",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xd470f8b0e6e30748498b6a35e6488e8e433a3576",
            "value": "25000000000000000",
            "gas": "21000",
            "gasPrice": "31323664910",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "3109262",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "3359953",
            "isError": "0"
        },
        {
            "blockNumber": "17492880",
            "blockHash": "0x7bd0a41f156c68fbdb103183e69a6ba8e32bdd76899e490624c546bef6c40e67",
            "timeStamp": "1686924371",
            "hash": "0x89bd4a4df912e65ed3cbaac306b62911c4569d0a5746bc9d051de8c6907145c8",
            "nonce": "14",
            "transactionIndex": "202",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xe5b1f760ba4334bc311695e125861eb5870018ad",
            "value": "40000000000000000",
            "gas": "21000",
            "gasPrice": "28042716070",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "10285322",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "3202324",
            "isError": "0"
        },
        {
            "blockNumber": "17813825",
            "blockHash": "0x9f97a18eeebc8ad470351e3a9396176bb339ce499f3a45f9b89ba5414f18ac89",
            "timeStamp": "1690816571",
            "hash": "0x770f152f1fb068398023ee01990a1897a79173693a64315f39dfe318bf818774",
            "nonce": "15",
            "transactionIndex": "67",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xa7090b1f22f12d726dfd81c4bae3d768a241de38",
            "value": "31557632947015717",
            "gas": "21000",
            "gasPrice": "67781534546",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "6643995",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "2881379",
            "isError": "0"
        },
        {
            "blockNumber": "17830771",
            "blockHash": "0x3e6971666d5ebb00bdeed76541bc4a072d7444a7d7a0d2f2c20b3443bb6a550b",
            "timeStamp": "1691020991",
            "hash": "0x0e7cac0c16ab17b191cf1f76efb4560ea473df18a2acdf39c40ee3a50ffb707b",
            "nonce": "16",
            "transactionIndex": "2",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xe5b1f760ba4334bc311695e125861eb5870018ad",
            "value": "28000000000000000",
            "gas": "21000",
            "gasPrice": "36376419215",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "402654",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "2864433",
            "isError": "0"
        },
        {
            "blockNumber": "18083717",
            "blockHash": "0x0fce459b168cb79188d52dc73ba1c4e502329f8118fddf1c054da67da80f6699",
            "timeStamp": "1694079635",
            "hash": "0x51cba84049414c5983e0843a3498367abb5c14704e2794b5c8b2870de13b139c",
            "nonce": "17",
            "transactionIndex": "203",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xe5b1f760ba4334bc311695e125861eb5870018ad",
            "value": "80000000000000000",
            "gas": "21000",
            "gasPrice": "15819203895",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "15717734",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "2611487",
            "isError": "0"
        },
        {
            "blockNumber": "18084862",
            "blockHash": "0xf3b4a9292428ab8151583e6b53982ea5272c46643ca000451d2a97140a8db1b3",
            "timeStamp": "1694093519",
            "hash": "0xa1d681f7dd6a0cea155748d10cd39f5eb82b88712ed2f7144bb6c4b11cd59c61",
            "nonce": "18",
            "transactionIndex": "40",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xe5b1f760ba4334bc311695e125861eb5870018ad",
            "value": "65000000000000000",
            "gas": "21000",
            "gasPrice": "18350485170",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "4360079",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "2610342",
            "isError": "0"
        },
        {
            "blockNumber": "18184133",
            "blockHash": "0xdb86b509d264ff752f81cd773e408247ca93925dd424df0e58973c1ed7e8564c",
            "timeStamp": "1695297887",
            "hash": "0x3d1328c5e01d49e3881e104278d5107b1dfd9a369b56ad902bad91486859d9b5",
            "nonce": "19",
            "transactionIndex": "53",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            "value": "0",
            "gas": "68647",
            "gasPrice": "9079085672",
            "input": "0xa9059cbb0000000000000000000000001c39d42caec90e3566321b2faf4fdbbac10330500000000000000000000000000000000000000000000000005834763d59e6e800",
            "methodId": "0xa9059cbb",
            "functionName": "transfer(address _to, uint256 _value)",
            "contractAddress": "",
            "cumulativeGasUsed": "3131769",
            "txreceipt_status": "1",
            "gasUsed": "52406",
            "confirmations": "2511071",
            "isError": "0"
        },
        {
            "blockNumber": "18184160",
            "blockHash": "0xa2457400e790e10474100b17ecdfec22f4cf127beb51e7f162b4a3822bf3d789",
            "timeStamp": "1695298211",
            "hash": "0x0449fc468a1eb4f854995d0907960d1af3245225ad1ee112f11a8f17ff169ce0",
            "nonce": "20",
            "transactionIndex": "63",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "value": "0",
            "gas": "55331",
            "gasPrice": "8883453842",
            "input": "0xa9059cbb0000000000000000000000001c39d42caec90e3566321b2faf4fdbbac10330500000000000000000000000000000000000000000000000000000000004078d6c",
            "methodId": "0xa9059cbb",
            "functionName": "transfer(address _to, uint256 _value)",
            "contractAddress": "",
            "cumulativeGasUsed": "9810332",
            "txreceipt_status": "1",
            "gasUsed": "41309",
            "confirmations": "2511044",
            "isError": "0"
        },
        {
            "blockNumber": "18184221",
            "blockHash": "0x5a2bd1cdc3aaa2064e3d9b3b76bb6a011ca08fd1c4b68a072a7e33a00f682729",
            "timeStamp": "1695298943",
            "hash": "0x22065ec6f4b2ece03b7926a489b6967317125448879cc16a860fefc91b935474",
            "nonce": "21",
            "transactionIndex": "99",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xe5b1f760ba4334bc311695e125861eb5870018ad",
            "value": "30799280000000000",
            "gas": "21000",
            "gasPrice": "9681999502",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "10937987",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "2510983",
            "isError": "0"
        },
        {
            "blockNumber": "18790328",
            "blockHash": "0x319445e0f9cbdf0caab5b5f96bd4b498ef30abc01c642795382a26e0f007493b",
            "timeStamp": "1702628903",
            "hash": "0xcc8d8b9ae26e0cfcad1b31a4a53b901ddf460d71f7d680c47149e0b40d596f22",
            "nonce": "22",
            "transactionIndex": "68",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "value": "0",
            "gas": "63209",
            "gasPrice": "52704722129",
            "input": "0xa9059cbb0000000000000000000000001c39d42caec90e3566321b2faf4fdbbac10330500000000000000000000000000000000000000000000000000000000004337184",
            "methodId": "0xa9059cbb",
            "functionName": "transfer(address _to, uint256 _value)",
            "contractAddress": "",
            "cumulativeGasUsed": "9245698",
            "txreceipt_status": "1",
            "gasUsed": "58409",
            "confirmations": "1904876",
            "isError": "0"
        },
        {
            "blockNumber": "18790412",
            "blockHash": "0xfb61a7c2381929bd4ea5bdbeed1861410a8e513b5e75373c2cd36cf4b4bda775",
            "timeStamp": "1702629911",
            "hash": "0x1c7a0ef9c17fc075a3de5a2d4b4600e680ece2904d14677fb6e397126cd39a35",
            "nonce": "23",
            "transactionIndex": "118",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xdacf612bd74c3f1fd1e7a6e6faee4a06e5b4b4db",
            "value": "18999483939523736",
            "gas": "21000",
            "gasPrice": "42730224118",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "8584113",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "1904792",
            "isError": "0"
        },
        {
            "blockNumber": "18975623",
            "blockHash": "0x782ff8aa97eb8fa20f72ca6ffe98d884a80d4918d0c02e74ab4859e154995f7c",
            "timeStamp": "1704878543",
            "hash": "0x666ad9b0371b3e175d7e1ac7b3a3b2f9dd3a17ceb94ce4368e3232b1fdb90f85",
            "nonce": "24",
            "transactionIndex": "65",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xe5b1f760ba4334bc311695e125861eb5870018ad",
            "value": "30000000000000000",
            "gas": "21000",
            "gasPrice": "28175583728",
            "input": "0x",
            "methodId": "0x",
            "functionName": "",
            "contractAddress": "",
            "cumulativeGasUsed": "5872494",
            "txreceipt_status": "1",
            "gasUsed": "21000",
            "confirmations": "1719581",
            "isError": "0"
        },
        {
            "blockNumber": "19582215",
            "blockHash": "0xf5376aefc519688362a7733afbf9547343747a480dd27eaa8c0b8c9f46fcd5dd",
            "timeStamp": "1712231435",
            "hash": "0x3236956c8d9e038c0157b98bf1236c21a0cae21cc548374873fb18a8e9400721",
            "nonce": "25",
            "transactionIndex": "77",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "value": "0",
            "gas": "46097",
            "gasPrice": "19665353388",
            "input": "0xa9059cbb000000000000000000000000e5b1f760ba4334bc311695e125861eb5870018ad0000000000000000000000000000000000000000000000000000000006422c40",
            "methodId": "0xa9059cbb",
            "functionName": "transfer(address _to, uint256 _value)",
            "contractAddress": "",
            "cumulativeGasUsed": "5409191",
            "txreceipt_status": "1",
            "gasUsed": "46097",
            "confirmations": "1112989",
            "isError": "0"
        },
        {
            "blockNumber": "20217628",
            "blockHash": "0xa89c34e914961343cae312cfe16965a2bb1c1da3d9d9b8d109a8f1ff886f656a",
            "timeStamp": "1719908795",
            "hash": "0x66f93590074990e9bc7cb4200e9b5b58a77be5c16b8f5bc1bdb4ca30b91cdd47",
            "nonce": "26",
            "transactionIndex": "64",
            "from": "0x0ac397cdbcd7a0627035c9608bc8940a89e6fddc",
            "to": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "value": "0",
            "gas": "62745",
            "gasPrice": "4764456927",
            "input": "0xa9059cbb000000000000000000000000804bf681c2814787cabae299cc02bce7f9b4b4e70000000000000000000000000000000000000000000000000000000002d7ff30",
            "methodId": "0xa9059cbb",
            "functionName": "transfer(address _to, uint256 _value)",
            "contractAddress": "",
            "cumulativeGasUsed": "9995454",
            "txreceipt_status": "1",
            "gasUsed": "57460",
            "confirmations": "477576",
            "isError": "0"
        }
    ]
}

const generateNode = (wallet: Wallet, index: number, totalWallets: number, isRoot: boolean = false) => {
    const angle = isRoot ? 0 : ((index + 1) / totalWallets) * 2 * Math.PI;
    const radius = isRoot ? 0 : 300; // Increased radius for better spacing
    return {
      id: wallet.wallet,
      data: { 
        label: isRoot ? 'Root Wallet' : `Wallet ${index + 1}`,
        address: wallet.wallet,
        balance: wallet.balance,
        score: wallet.score,
        reasons: wallet.reasons
      },
      position: { 
        x: 500 + radius * Math.cos(angle), 
        y: 300 + radius * Math.sin(angle) 
      },
      className: `bg-white text-gray-800 border ${isRoot ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-48 text-xs shadow-md`,
    };
  };
  
  const generateEdge = (source: string, target: string, index: number) => ({
    id: `e${index}`,
    source,
    target,
    label: 'Transaction',
    type: 'smoothstep',
    animated: true,
    labelStyle: { fill: '#666', fontWeight: 500 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#FF0000',
    },
    style: { stroke: '#FF0000' },
  });
  
  export default function CryptoTransactionGraph() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [hoveredElement, setHoveredElement] = useState<Node | Edge | null>(null);
  
    useEffect(() => {
      const rootWallet = { wallet: data.wallet_address, balance: 0, reasons: [], score: 0 };
      const newNodes = [generateNode(rootWallet, -1, data.explored_wallets.length, true), 
        ...data.explored_wallets.map((wallet, index) => 
          generateNode(wallet, index, data.explored_wallets.length)
        )
      ];
      setNodes(newNodes);
  
      const newEdges = data.explored_wallets.map((_, index) => 
        generateEdge(data.wallet_address, newNodes[index + 1].id, index)
      );
      setEdges(newEdges);
    }, []);
  
    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  
    const onElementMouseEnter = useCallback((event: React.MouseEvent, element: Node | Edge) => {
      setHoveredElement(element);
    }, []);
  
    const onElementMouseLeave = useCallback(() => {
      setHoveredElement(null);
    }, []);
  
    return (
      <div className="w-full h-screen relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeMouseEnter={onElementMouseEnter}
          onNodeMouseLeave={onElementMouseLeave}
          onEdgeMouseEnter={onElementMouseEnter}
          onEdgeMouseLeave={onElementMouseLeave}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        
        {hoveredElement && 'data' in hoveredElement && (
          <div className="absolute top-4 right-4 bg-white p-4 rounded-md shadow-md max-w-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Wallet Details
            </h3>
            <p className="text-sm text-gray-700"><strong>Wallet:</strong> {hoveredElement.data.label}</p>
            <p className="text-sm text-gray-700"><strong>Address:</strong> {hoveredElement.data.address}</p>
            <p className="text-sm text-gray-700"><strong>Balance:</strong> {hoveredElement.data.balance} ETH</p>
            <p className="text-sm text-gray-700"><strong>Suspicion Score:</strong> {hoveredElement.data.score}</p>
            {hoveredElement.data.reasons.length > 0 && (
              <>
                <p className="text-sm text-gray-700 mt-2"><strong>Suspicious Patterns:</strong></p>
                <ul className="list-disc list-inside">
                  {hoveredElement.data.reasons.map((reason: any, index: any) => (
                    <li key={index} className="text-xs text-gray-600">{reason}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    );
  }


  