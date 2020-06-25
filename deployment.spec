###############################################################################
# Spec file for Utils
################################################################################
Summary: Installs Deployment-Server API and UI
Name: Deployment-Server
Version: 0.0.0
License: GPL
Release: 1
Group: System
Packager: William Avery
Requires: node
BuildRoot: ~/rpmbuild/

# Build with the following syntax:
# rpmbuild --target noarch -bb deployment.spec

%description

%prep
################################################################################
# Create the build tree and copy the files from the development directories    #
# into the build tree.                                                         #
################################################################################
rm -rf $workdir
echo "BUILDROOT = $RPM_BUILD_ROOT"
mkdir -p $RPM_BUILD_ROOT/opt/arlut/Deployment-Server
mkdir -p $RPM_BUILD_ROOT/etc/systemd/system
cp -r /builds/arlsummer2020/deployment-services/{ui,server,package.json,package-lock.json} $RPM_BUILD_ROOT/opt/arlut/Deployment-Server
cp -r /builds/arlsummer2020/deployment-services/deployment.service $RPM_BUILD_ROOT/etc/systemd/system

exit

%files
%attr(0644, root, root) /opt/arlut
%attr(0644, root, root) /etc/systemd/system

%pre

%post
cd /opt/arlut/Deployment-Server
npm install
cd server
npm install
cd ../ui
npm install
systemctl stop deployment
systemctl enable deployment
systemctl start deployment

exit

%postun
systemctl stop deployment
systemctl disable deployment

%clean
rm -rf $RPM_BUILD_ROOT/opt/arlut
rm -rf $RPM_BUILD_ROOT/etc/systemd/system

%changelog