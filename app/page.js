"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, Label } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Moon, RefreshCw, RotateCw, Sun } from "lucide-react";
import { useTheme } from "@/context/theme";

// Function to format CPU and Memory
const formatCPU = (cpu) => {
  const value = parseInt(cpu.replace("n", ""), 10);
  return `${Math.round(value / 1e6)}m`; // Convert n to m
};

const formatMemory = (memory) => {
  const value = parseInt(memory.replace("Ki", ""), 10);
  return `${Math.round(value / 1024)}Mi`; // Convert Ki to Mi
};

const formatCPUCapaity = (cpuCapacity) => {
  return parseInt(cpuCapacity, 10) * 1000; // Convert cores to millicores
};

const calculatePercent = (cap, use) => {
  const extractNumber = (value) => {
    if (typeof value === "string") {
      const num = parseFloat(value.match(/\d+(\.\d+)?/)); // Match numeric part
      return isNaN(num) ? null : num;
    }
    return typeof value === "number" ? value : null;
  };

  // Extract numbers
  const capNum = extractNumber(cap);
  const useNum = extractNumber(use);

  // Validate extracted numbers
  if (capNum === null || useNum === null || capNum === 0) {
    return "N/A"; // Return "N/A" for invalid inputs or division by zero
  }

  // Calculate percentage
  const percentage = (useNum / capNum) * 100;
  return `${percentage.toFixed(2)}%`; // Format to 2 decimal places
};

// Helper function to add a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Page = () => {
  const { theme, toggleTheme } = useTheme();

  const [nodeMetrics, setNodeMetrics] = useState([]);
  const [podMetrics, setPodMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartColors, setChartColors] = useState([]);
  const API_BASE_URL = "/api/metrics"; // Replace with your API URL

  const fetchMetrics = async (endpoint) => {
    try {
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching metrics:", error);
      return null;
    }
  };

  const fetchData = async () => {
    setLoading(true); // Set loading to true while fetching
    try {
      await delay(900);
      const nodes = await fetchMetrics(`${API_BASE_URL}/nodes`);
      const pods = await fetchMetrics(`${API_BASE_URL}/pods?namespace=default`);
      const nodesCap = await fetchMetrics(`${API_BASE_URL}/nodes/capacity`);

      // Combine metrics with capacities
      const combinedNodeMetrics = nodes?.items.map((node) => {
        const matchingCapacity = nodesCap?.items.find(
          (capNode) => capNode.metadata.name === node.metadata.name,
        );

        return {
          name: node.metadata.name,
          cpuUsage: formatCPU(node.usage.cpu), // Convert CPU usage to millicores
          memoryUsage: formatMemory(node.usage.memory), // Format memory usage
          cpuCapacity: matchingCapacity
            ? formatCPUCapaity(matchingCapacity.status.capacity.cpu)
            : "N/A", // Default to "N/A" if no match is found
          memoryCapacity: matchingCapacity
            ? formatMemory(matchingCapacity.status.capacity.memory)
            : "N/A", // Default to "N/A" if no match is found
        };
      });

      setNodeMetrics(combinedNodeMetrics || []);
      setPodMetrics(pods?.items || []);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };
  const getChartColors = () => {
    const rootStyles = getComputedStyle(document.documentElement);
    return [
      rootStyles.getPropertyValue("--chart-1").trim(),
      rootStyles.getPropertyValue("--chart-2").trim(),
      rootStyles.getPropertyValue("--chart-3").trim(),
      rootStyles.getPropertyValue("--chart-4").trim(),
      rootStyles.getPropertyValue("--chart-5").trim(),
    ].map((color) => `hsl(${color})`); // Convert HSL strings to valid CSS colors
  };
  useEffect(() => {
    fetchData(); // Fetch data on component mount
    setChartColors(getChartColors());
  }, []);

  // Prepare Pie Chart Data
  const pieChartData = nodeMetrics.map((node) => {
    const cpuUsed = parseFloat(node.cpuUsage.replace("m", "")) || 0;
    const cpuRemaining =
      (node.cpuCapacity !== "N/A" ? parseFloat(node.cpuCapacity) : 0) - cpuUsed;

    const memoryUsed = parseFloat(node.memoryUsage.replace("Mi", "")) || 0;
    const memoryRemaining =
      (node.memoryCapacity !== "N/A"
        ? parseFloat(node.memoryCapacity.replace("Mi", ""))
        : 0) - memoryUsed;

    return {
      node: node.name,
      cpuUsed,
      cpuRemaining: Math.max(0, cpuRemaining),
      memoryUsed,
      memoryRemaining: Math.max(0, memoryRemaining),
      cpuPercent: calculatePercent(node.cpuCapacity, node.cpuUsage),
      memoryPercent: calculatePercent(node.memoryCapacity, node.memoryUsage),
    };
  });
  return (
    <div className="p-4 min-h-screen dark:bg-slate-950 bg-slate-50 text-slate-950 dark:text-slate-100 transition-all ease-in-out duration-300">
      {/* Header */}
      <div className="flex gap-5 items-center">
        <h1 className="text-2xl font-bold">Kubernetes Metrics</h1>
        <button
          onClick={fetchData}
          className="flex items-center px-4 py-2 w-fit bg-blue-600 text-white rounded hover:bg-blue-700 transition-all ease-in-out duration-200"
          disabled={loading}
        >
          {loading ? (
            <RotateCw className="animate-spin h-5 w-5 " />
          ) : (
            <RotateCw className="h-5 w-5" />
          )}
        </button>
        {/* Theme Toggle Button */}
        <div className="flex justify-between items-center">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 dark:bg-slate-900 border-blue-600 dark:border-yellow-300 border-2 rounded-full"
          >
            {theme === "dark" ? (
              <Sun size={20} className="text-yellow-300" />
            ) : (
              <Moon size={20} className="text-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Node Metrics Table */}
      <h2 className="text-xl mt-5 font-semibold mb-2">Node Metrics</h2>
      <div className="mb-8  ">
        <Table className="text-lg w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Node Name</TableHead>
              <TableHead>CPU Capacity</TableHead>
              <TableHead>CPU Usage</TableHead>
              <TableHead>CPU Usage(%)</TableHead>
              <TableHead>Memory Capacity</TableHead>
              <TableHead>Memory Usage</TableHead>
              <TableHead>Memory Usage(%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nodeMetrics.map((node) => (
              <TableRow key={node.name}>
                <TableCell>{node.name}</TableCell>
                <TableCell>
                  {node.cpuCapacity !== "N/A" ? `${node.cpuCapacity}m` : "N/A"}
                </TableCell>
                <TableCell>{node.cpuUsage}</TableCell>
                <TableCell>
                  {calculatePercent(node.cpuCapacity, node.cpuUsage)}
                </TableCell>
                <TableCell>
                  {node.memoryCapacity !== "N/A"
                    ? `${node.memoryCapacity}`
                    : "N/A"}
                </TableCell>
                <TableCell>{node.memoryUsage}</TableCell>
                <TableCell>
                  {calculatePercent(node.memoryCapacity, node.memoryUsage)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className=" flex ">
          <div className="flex flex-col md:flex-row py-12 gap-32">
            {/* CPU Usage Pie Charts */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-4">
                {pieChartData.map((data) => (
                  <div key={data.node} className="flex flex-col items-center">
                    <h3 className="text-lg font-medium mb-2">{data.node}</h3>
                    <PieChart width={250} height={250}>
                      <Pie
                        data={[
                          { name: "CPU Used", value: data.cpuUsed },
                          { name: "CPU Remaining", value: data.cpuRemaining },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        fill="#0f172a"
                        dataKey="value"
                      >
                        <Label
                          value={data.cpuPercent}
                          position="center"
                          className="text-xl font-semibold"
                        />
                        <Cell fill={chartColors[0]} />
                        <Cell fill={chartColors[1]} />
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </div>
                ))}
              </div>
            </div>

            {/* Memory Usage Pie Charts */}
            <div className="mb-8">
              <div className="flex flex-wrap">
                {pieChartData.map((data) => (
                  <div key={data.node} className="flex flex-col items-center">
                    <h3 className="text-lg font-medium mb-2">{data.node}</h3>
                    <PieChart width={250} height={250}>
                      <Pie
                        data={[
                          { name: "Memory Used", value: data.memoryUsed },
                          {
                            name: "Memory Remaining",
                            value: data.memoryRemaining,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Label
                          value={data.memoryPercent}
                          position="center"
                          className="text-xl font-semibold"
                        />
                        <Cell fill={chartColors[0]} />
                        <Cell fill={chartColors[1]} />
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pod Metrics Table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Pod Metrics</h2>
        <Table className="text-lg w-full">
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
                  {pod.containers[0]?.usage?.cpu
                    ? formatCPU(pod.containers[0].usage.cpu)
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {pod.containers[0]?.usage?.memory
                    ? formatMemory(pod.containers[0].usage.memory)
                    : "N/A"}
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
