"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, RotateCw } from "lucide-react";

const fetchMetrics = async (endpoint) => {
  try {
    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return null;
  }
};

// Function to format CPU and Memory
const formatCPU = (cpu) => {
  const value = parseInt(cpu.replace("n", ""), 10);
  return `${Math.round(value / 1e6)}m`; // Convert n to m
};

const formatMemory = (memory) => {
  const value = parseInt(memory.replace("Ki", ""), 10);
  return `${Math.round(value / 1024)}Mi`; // Convert Ki to Mi
};

const Page = () => {
  const [nodeMetrics, setNodeMetrics] = useState([]);
  const [podMetrics, setPodMetrics] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state
  const API_BASE_URL = "/api/metrics"; // Replace with your API URL

  const fetchData = async () => {
    setLoading(true); // Set loading to true while fetching
    try {
      const nodes = await fetchMetrics(`${API_BASE_URL}/nodes`);
      const pods = await fetchMetrics(`${API_BASE_URL}/pods?namespace=default`);

      setNodeMetrics(nodes?.items || []);
      setPodMetrics(pods?.items || []);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data on component mount
  }, []);

  return (
    <div className="p-4">
      <div className=" flex gap-5">
        <h1 className="text-2xl font-bold mb-4">Kubernetes Metrics</h1>

        <div className="mb-4">
          <button
            onClick={fetchData} // Trigger fetchData on button click
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all ease-in-out duration-200"
            disabled={loading} // Disable button while loading
          >
            {loading ? <RefreshCw /> : <RotateCw />}
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Node Metrics</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Node Name</TableHead>
              <TableHead>CPU Usage</TableHead>
              <TableHead>Memory Usage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nodeMetrics.map((node) => (
              <TableRow key={node.metadata.name}>
                <TableCell>{node.metadata.name}</TableCell>
                <TableCell>{formatCPU(node.usage.cpu)}</TableCell>
                <TableCell>{formatMemory(node.usage.memory)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Pod Metrics</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pod Name</TableHead>
              <TableHead>Namespace</TableHead>
              <TableHead>CPU Usage</TableHead>
              <TableHead>Memory Usage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {podMetrics.map((pod) => (
              <TableRow key={pod.metadata.name}>
                <TableCell>{pod.metadata.name}</TableCell>
                <TableCell>{pod.metadata.namespace}</TableCell>
                <TableCell>
                  {formatCPU(pod.containers[0]?.usage?.cpu) || "N/A"}
                </TableCell>
                <TableCell>
                  {formatMemory(pod.containers[0]?.usage?.memory) || "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;
