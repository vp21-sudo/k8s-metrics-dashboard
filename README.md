
# Kubernetes Metrics Dashboard

A **Next.js** application that provides a dashboard to display Kubernetes node and pod metrics fetched directly from the Kubernetes Metrics API. This project is designed to work with a **Docker Desktop Kubernetes cluster** for local development.

---

## 📝 Overview

This application serves as a simple Kubernetes metrics dashboard using the **Next.js App Router** and **Kubernetes Metrics Server**. The backend APIs are integrated within the Next.js application to fetch metrics for nodes and pods.

### **Features**
- Displays **CPU Usage** in millicores (`m`) and **Memory Usage** in Mebibytes (`Mi`).
- Uses Kubernetes Metrics API for real-time resource usage.
- Includes endpoints for:
  - **Node Metrics**: `/api/metrics/nodes`
  - **Pod Metrics**: `/api/metrics/pods`

---

## 🚀 Getting Started

### Prerequisites

1. **Docker Desktop**:
   - Ensure Docker Desktop is installed and Kubernetes is enabled.

2. **Metrics Server**:
   - The Kubernetes Metrics Server must be deployed in your cluster.
     ```bash
     kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
     ```

3. **Node.js & npm**:
   - Install [Node.js](https://nodejs.org/) and npm.

4. **Service Account**:
   - Create a Kubernetes Service Account to fetch metrics.

---

### ⚙️ Setup Kubernetes Service Account

1. **Create Service Account**:
  ```bash
   kubectl create serviceaccount admin
 ```

2. **Generate a Token**:
  ```bash
   kubectl create clusterrolebinding admin-binding \
   --clusterrole=cluster-admin \
   --serviceaccount=default:admin
 ```
3. **Bind Admin Role**:
  ```bash
   TOKEN=$(kubectl create token admin) echo $TOKEN
 ```
 4. **Save the Token**:
  Copy the generated token for use in the `.env.local` file.

## 📊 Future Improvements

1.  **Real-Time Data**:

    -   Use WebSocket or Server-Sent Events (SSE) to display live updates.
2.  **Historical Data**:

    -   Store metrics in a time-series database (e.g., Prometheus, TimescaleDB) for historical analysis.
3.  **Visualization Dashboard**:

    -   Add interactive charts and graphs to analyze resource usage patterns.
4.  **Enhanced Metrics**:

    -   Include additional metrics (e.g., network I/O, storage utilization).
5.  **Authentication**:

    -   Add user authentication to secure access to the dashboard.
