cd ..
cd ..
cd ..
mkdir Deployment-Downloads
cd Deployment-Downloads
mkdir $1
cd $1
curl -L --output artifacts.zip "$2"