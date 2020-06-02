while getopts d: option
do
case "${option}"
in
d) DIR=${OPTARG};;
esac
done

cd ..
cd ..
cd Deployments
mkdir DIR