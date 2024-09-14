$provisioningScript = <<SCRIPT

sudo apk update
sudo apk upgrade

# Install nginx
sudo apk add nginx

sudo rm /etc/nginx/http.d/default.conf

# Configure host
cat << 'EOF' > /etc/nginx/http.d/default.conf
server
{
    include mime.types;
    types 
    {
        application/javascript mjs;
    }
        
    listen  80;
    root /vagrant;
    index index.html index.htm;
    server_name _;
    location "/"
    {
        try_files $uri $uri/ /index.html?$args;
    }
}
EOF

SCRIPT

$startScript = <<START_SCRIPT
sudo service nginx restart
START_SCRIPT

Vagrant.configure("2") do |config|
  config.vm.box = "boxen/alpine-3.19.0"
  config.vm.provision :shell, inline: $provisioningScript
  config.vm.provision "shell", inline: $startScript, run: "always"
  config.vm.network "private_network", type: "dhcp"
end
