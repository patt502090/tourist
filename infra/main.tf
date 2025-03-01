provider "google" {
  project = "tourist-xxxxxx"  # ใส่ Project ID ของคุณ
  region  = "asia-southeast1"  # กำหนด Region ที่ต้องการใช้
}

# สร้าง GKE Cluster
resource "google_container_cluster" "tourist_cluster" {
  name     = "tourist-cluster"
  location = "asia-southeast1"
  initial_node_count = 3

  # การตั้งค่า Node Pools
  node_config {
    machine_type = "e2-medium"  # ขนาด VM ของ Node
    disk_size_gb = 20  # ขนาดดิสก์ของ Node
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }

  # Enable Auto-scaling (ปรับจำนวน Node อัตโนมัติ)
  autoscaling {
    min_node_count = 1
    max_node_count = 5
  }

  # Enable Load Balancer
  enable_http_load_balancing = true

  # Enable Kubernetes Dashboard
  enable_kubernetes_dashboard = true
}

resource "google_compute_instance" "tourist_vm" {
  name         = "tourist-vm"
  machine_type = "e2-medium"
  zone         = "asia-southeast1-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network = "default"
    access_config {}  # เปิด External IP
  }

  metadata_startup_script = <<-EOF
    #! /bin/bash
    apt update && apt install -y docker.io
    systemctl start docker
  EOF
}
