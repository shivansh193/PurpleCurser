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

const generateWalletAddress = () => {
  return '0x' + Array(40).fill(0).map(() => Math.random().toString(16)[2]).join('');
};

type HoveredElement = Node<{ label: string; address: string }> | Edge | null;
const generateTransaction = (fromWallet: any, toWallet:any) => {
  return {
    from: fromWallet,
    to: toWallet,
    amount: parseFloat((Math.random() * 10).toFixed(4)),
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
  };
};

const generateCryptoData = (walletCount: any, transactionCount:any) => {
  const wallets = Array.from({ length: walletCount }, generateWalletAddress);
  const transactions = [];

  // Ensure the seed wallet has outgoing transactions
  const seedWallet = wallets[0];
  for (let i = 0; i < Math.min(5, walletCount - 1); i++) {
    transactions.push(generateTransaction(seedWallet, wallets[i + 1]));
  }

  // Generate remaining random transactions
  for (let i = transactions.length; i < transactionCount; i++) {
    const fromIndex = Math.floor(Math.random() * walletCount);
    let toIndex;
    do {
      toIndex = Math.floor(Math.random() * walletCount);
    } while (toIndex === fromIndex);

    transactions.push(generateTransaction(wallets[fromIndex], wallets[toIndex]));
  }

  return { wallets, transactions };
};

const generateNode = (wallet: any, index: any, totalWallets: any) => {
  const angle = (index / totalWallets) * 2 * Math.PI;
  const radius = Math.min(window.innerWidth, window.innerHeight) * 0.4;
  return {
    id: wallet,
    data: { label: `Wallet ${index + 1}`, address: wallet },
    position: { 
      x: window.innerWidth / 2 + radius * Math.cos(angle), 
      y: window.innerHeight / 2 + radius * Math.sin(angle) 
    },
    className: 'bg-white text-gray-800 border border-gray-300 rounded-md p-2 w-48 text-xs shadow-md',
  };
};

const generateEdge = (transaction: any, index: any) => ({
  id: `e${index}`,
  source: transaction.from,
  target: transaction.to,
  label: `${transaction.amount} ETH`,
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
  const [cryptoData, setCryptoData] = useState(() => generateCryptoData(20, 30));
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [hoveredElement, setHoveredElement] = useState<HoveredElement>(null);

  useEffect(() => {
    const newNodes = cryptoData.wallets.map((wallet, index) => 
      generateNode(wallet, index, cryptoData.wallets.length)
    );
    setNodes(newNodes);

    const newEdges = cryptoData.transactions.map((transaction, index) => 
      generateEdge(transaction, index)
    );
    setEdges(newEdges);
  }, [cryptoData, setNodes, setEdges]);

  const onConnect = useCallback((params: any) => setEdges((eds: any) => addEdge(params, eds)), [setEdges]);

  const onElementMouseEnter = useCallback((event: any, element: any) => {
    setHoveredElement(element);
  }, []);

  const onElementMouseLeave = useCallback(() => {
    setHoveredElement(null);
  }, []);
  const isEdge = (element: Node | Edge): element is Edge => 'source' in element;
  const isNode = (element: HoveredElement): element is Node<{ label: string; address: string }> => 
    element !== null && 'data' in element;
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
      {hoveredElement && (
  <div className="absolute top-4 right-4 bg-white p-4 rounded-md shadow-md max-w-sm">
    <h3 className="text-lg font-semibold mb-2">
      {isEdge(hoveredElement) ? 'Transaction Details' : 'Wallet Details'}
    </h3>
    {isEdge(hoveredElement) ? (
      <>
        <p className="text-sm"><strong>From:</strong> {hoveredElement.source}</p>
        <p className="text-sm"><strong>To:</strong> {hoveredElement.target}</p>
        <p className="text-sm"><strong>Amount:</strong> {hoveredElement.label}</p>
      </>
    ) : isNode(hoveredElement) && (
        <>
          <p className="text-sm"><strong>Wallet:</strong> {hoveredElement.data.label}</p>
          <p className="text-sm"><strong>Address:</strong> {hoveredElement.data.address}</p>
        </>
      )}
    </div>
  )}
      <button 
        className="absolute bottom-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={() => setCryptoData(generateCryptoData(
          Math.floor(Math.random() * 30) + 10,
          Math.floor(Math.random() * 50) + 20
        ))}
      >
        Regenerate Transactions
      </button>
    </div>
  );
}