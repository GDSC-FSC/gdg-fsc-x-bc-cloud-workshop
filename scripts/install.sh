#!/bin/bash
# -*- shell -*-

set -euo pipefail
IFS=$'\n\t'

# Color codes for logging
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

log_info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
log_success() { echo -e "${GREEN}[OK]${NC} $*"; }

usage() {
    cat <<EOF
Usage: $0 [--yes] [--help]

Options:
  --yes     Run non-interactively (assume 'yes' to all prompts)
  --help    Show this help message
EOF
}

# Parse args
YES=0
for arg in "$@"; do
    case "$arg" in
        --yes) YES=1 ;;
        --help) usage; exit 0 ;;
        *) log_error "Unknown argument: $arg"; usage; exit 2 ;;
    esac
done

command_exists() { command -v "$1" >/dev/null 2>&1; }

prompt() {
    local msg="$1"
    if [[ $YES -eq 1 ]]; then
        log_info "$msg (auto-yes)"
        return 0
    fi
    read -p "$msg (y/n) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

require_sudo() {
    if [[ $EUID -ne 0 ]]; then
        if command_exists sudo; then
            log_warn "Some operations require root. You may be prompted for your password."
        else
            log_error "This script requires root privileges or sudo."
            exit 1
        fi
    fi
}

install_docker() {
    require_sudo
    case "$(uname -s)" in
        Linux)
            if command_exists apt-get; then
                log_info "Installing Docker on Debian/Ubuntu..."
                sudo apt-get update
                sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common lsb-release
                curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
                sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
                sudo apt-get update
                sudo apt-get install -y docker-ce
                sudo usermod -aG docker "$USER"
                log_success "Docker installed. Log out and back in for group changes."
            elif command_exists yum; then
                log_info "Installing Docker on RHEL/CentOS..."
                sudo yum install -y yum-utils
                sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
                sudo yum install -y docker-ce docker-ce-cli containerd.io
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker "$USER"
                log_success "Docker installed. Log out and back in for group changes."
            elif command_exists pacman; then
                log_info "Installing Docker on Arch Linux..."
                sudo pacman -Syu --noconfirm docker
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker "$USER"
                log_success "Docker installed. Log out and back in for group changes."
            else
                log_error "Unsupported Linux distribution. Please install Docker manually."
                exit 1
            fi
        ;;
        Darwin)
            log_info "Installing Docker Desktop on macOS (via Homebrew)..."
            if ! command_exists brew; then
                log_info "Homebrew not found. Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew install --cask docker
            log_success "Docker Desktop installed. Launch Docker Desktop to complete setup."
            ;;
        MINGW*|CYGWIN*|MSYS*)
            log_info "For Windows, install Docker Desktop from: https://www.docker.com/products/docker-desktop"
            ;;
        *)
            log_error "Unsupported OS: $(uname -s)"
            exit 1
            ;;
    esac
}

install_docker_compose() {
    get_latest_compose_version() {
        curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/'
    }
    local COMPOSE_VERSION
    COMPOSE_VERSION="$(get_latest_compose_version)"
    case "$(uname -s)" in
        Linux|Darwin)
            log_info "Installing Docker Compose ${COMPOSE_VERSION}..."
            sudo rm -f /usr/local/bin/docker-compose
            sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            sudo chmod +x /usr/local/bin/docker-compose
            log_success "Docker Compose ${COMPOSE_VERSION} installed."
            ;;
        MINGW*|CYGWIN*|MSYS*)
            log_info "Docker Compose is included with Docker Desktop for Windows."
            ;;
        *)
            log_error "Unsupported OS for Docker Compose: $(uname -s)"
            exit 1
            ;;
    esac
}

install_bun() {
    case "$(uname -s)" in
        Linux|Darwin)
            log_info "Installing Bun..."
            curl -fsSL https://bun.sh/install | bash
            for rc in "$HOME/.bashrc" "$HOME/.zshrc"; do
                if [ -f "$rc" ] && ! grep -q 'BUN_INSTALL' "$rc"; then
                    echo 'export BUN_INSTALL="$HOME/.bun"' >> "$rc"
                    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> "$rc"
                fi
            done
            export BUN_INSTALL="$HOME/.bun"
            export PATH="$BUN_INSTALL/bin:$PATH"
            log_success "Bun installed. Restart your shell or run 'source ~/.bashrc' or 'source ~/.zshrc'."
            ;;
        MINGW*|CYGWIN*|MSYS*)
            log_info "Installing Bun for Windows..."
            if command_exists powershell.exe; then
                powershell.exe -Command "irm bun.sh/install.ps1 | iex"
                log_success "Bun installed. Add '%USERPROFILE%\\.bun\\bin' to your PATH if needed."
            else
                log_error "PowerShell not found. Please install Bun manually from https://bun.sh/docs/installation#windows."
            fi
            ;;
        *)
            log_error "Unsupported OS for Bun: $(uname -s)"
            exit 1
            ;;
    esac
}

install_gcloud() {
    case "$(uname -s)" in
        Linux)
            if command_exists apt-get; then
                log_info "Installing Google Cloud SDK on Debian/Ubuntu..."
                sudo apt-get update
                sudo apt-get install -y apt-transport-https ca-certificates gnupg
                echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
                curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
                sudo apt-get update
                sudo apt-get install -y google-cloud-cli
                log_success "Google Cloud SDK installed."
            elif command_exists yum; then
                log_info "Installing Google Cloud SDK on RHEL/CentOS..."
                sudo tee -a /etc/yum.repos.d/google-cloud-sdk.repo << EOM
[google-cloud-cli]
name=Google Cloud CLI
baseurl=https://packages.cloud.google.com/yum/repos/cloud-sdk-el8-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=0
gpgkey=https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOM
                sudo yum install -y google-cloud-cli
                log_success "Google Cloud SDK installed."
            elif command_exists pacman; then
                log_info "Installing Google Cloud SDK on Arch Linux..."
                sudo pacman -Syu --noconfirm google-cloud-sdk
                log_success "Google Cloud SDK installed."
            else
                log_info "Installing Google Cloud SDK via install script..."
                curl https://sdk.cloud.google.com | bash
                exec -l $SHELL
                log_success "Google Cloud SDK installed. Restart your shell."
            fi
            ;;
        Darwin)
            log_info "Installing Google Cloud SDK on macOS..."
            if ! command_exists brew; then
                log_info "Homebrew not found. Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew install --cask google-cloud-sdk
            log_success "Google Cloud SDK installed."
            ;;
        MINGW*|CYGWIN*|MSYS*)
            log_info "For Windows, install Google Cloud SDK from: https://cloud.google.com/sdk/docs/install"
            log_info "Or use: (New-Object Net.WebClient).DownloadFile('https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe', '$env:Temp\GoogleCloudSDKInstaller.exe') & & $env:Temp\GoogleCloudSDKInstaller.exe"
            ;;
        *)
            log_error "Unsupported OS for Google Cloud SDK: $(uname -s)"
            exit 1
            ;;
    esac
}

# Check and install dependencies
if ! command_exists docker; then
    if prompt "Docker is not installed. Install it?"; then
        install_docker
    else
        log_error "Docker is required. Exiting."
        exit 1
    fi
fi

if ! command_exists docker-compose; then
    if prompt "Docker Compose is not installed. Install it?"; then
        install_docker_compose
    else
        log_error "Docker Compose is required. Exiting."
        exit 1
    fi
fi

if ! command_exists bun; then
    if prompt "Bun is not installed. Install it?"; then
        install_bun
    else
        log_error "Bun is required. Exiting."
        exit 1
    fi
fi

if ! command_exists gcloud; then
    if prompt "Google Cloud SDK is not installed. Install it?"; then
        install_gcloud
    else
        log_warn "Google Cloud SDK is recommended for deployment. Skipping."
    fi
fi

log_info "✅ All dependencies are installed and ready!"
log_info ""
log_info "Next steps:"
log_info "  1. './scripts/dev.sh'       - Start full dev environment"
log_info "  2. './scripts/db-setup.sh'  - Setup database"
log_info "  3. './scripts/db-seed.sh'   - Populate database"
log_info "  4. './scripts/test-api.sh'  - Test API endpoints"
log_info "  5. './scripts/frontend.sh'  - Manage frontend"
log_info ""
log_success "Installation complete!"