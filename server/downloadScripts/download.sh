cd ..
cd ..
cd Deployments
mkdir $1
cd $1
curl -L --output artifacts.zip "$2"