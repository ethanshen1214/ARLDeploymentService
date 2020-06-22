cd ..
cd ..
cd ..
mkdir Artifact-Downloads
cd Artifact-Downloads
rm -r $1
mkdir $1
cd $1
curl -L --output artifacts.zip "$2"
unzip artifacts.zip