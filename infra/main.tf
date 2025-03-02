provider "google" {
  project = "tourist-452409"
  region  = "asia-southeast1"
}

# สร้าง Artifact Registry Repository
resource "google_artifact_registry_repository" "tourist_repo" {
  location      = "asia-southeast1"
  repository_id = "tourist-repo"
  format        = "DOCKER"
}

# สร้าง GKE Cluster
resource "google_container_cluster" "tourist_cluster" {
  name     = "tourist-cluster"
  location = "asia-southeast1"
  # ลบ initial_node_count ออก เพราะจะกำหนดใน node_pool

  # ลบ node_config ออก เพราะจะย้ายไป node_pool

  # Enable HTTP Load Balancing
  addons_config {
    http_load_balancing {
      disabled = false
    }
  }

  # ลบ initial_node_count เพื่อให้ใช้ node_pool แทน
  remove_default_node_pool = true
  initial_node_count       = 1  # ต้องมีค่าเริ่มต้นก่อนลบ default pool
}

# สร้าง Node Pool แยกพร้อม Auto-scaling
resource "google_container_node_pool" "primary_nodes" {
  name       = "primary-node-pool"
  cluster    = google_container_cluster.tourist_cluster.name
  location   = "asia-southeast1"
  node_count = 1  # จำนวน node เริ่มต้น

  node_config {
    machine_type = "e2-medium"
    disk_size_gb = 20
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }

  # ตั้งค่า Auto-scaling
  autoscaling {
    min_node_count = 1
    max_node_count = 5
  }

  # การจัดการ Node Pool
  management {
    auto_repair  = true
    auto_upgrade = true
  }
}