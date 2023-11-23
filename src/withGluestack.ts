import {
    checkIfWorkspace,
    getDependenciesFromNodeModules,
    getExactDependenciesFromNodeModules,
  } from './utils';
  const findWorkspaceRoot = require('find-yarn-workspace-root');
  
  const gluestackDeps = [
    'react-native-paper'
  ];
  
  const reactNativeDeps = [
    'react-native',
    'react-native-web',
    'react-native-svg',
    'react-dom', 
    'react-art'
  ];
  
  export default function withGluestackUI(nextConfig: any = {}) {
    const currDir = process.cwd();
    let rootDependencyList = [];
    try {
      rootDependencyList = getDependenciesFromNodeModules(currDir, gluestackDeps);
    } catch (e) {}
  
    let rootExactDependencyList = [];
    try {
      rootExactDependencyList = getExactDependenciesFromNodeModules(
        currDir,
        reactNativeDeps
      );
    } catch (e) {}
  
    const workspaceRoot = findWorkspaceRoot(currDir); // Absolute path or null
    const metaWorkspace = checkIfWorkspace(currDir);
    let parentDependencyList = [];
    let parentExactDependencyList = [];
  
    if (metaWorkspace.isWorkspace) {
      try {
        parentDependencyList = getDependenciesFromNodeModules(
          metaWorkspace.workspacePath,
          gluestackDeps
        );
        parentExactDependencyList = getExactDependenciesFromNodeModules(
          metaWorkspace.workspacePath,
          reactNativeDeps
        );
      } catch (e) {}
    }

    if (workspaceRoot) {
      try {
        parentDependencyList = getDependenciesFromNodeModules(
          workspaceRoot,
          gluestackDeps
        );
        parentExactDependencyList = getExactDependenciesFromNodeModules(
          workspaceRoot,
          reactNativeDeps
        );
      } catch (e) {}
    }
    let gluestackUITranspileModules = Array.from(
      new Set([
        ...rootDependencyList,
        ...parentDependencyList,
        ...rootExactDependencyList,
        ...parentExactDependencyList,
        ...(nextConfig.transpilePackages || []),
      ])
    );
  
    const updatedNextConfig = {
      ...nextConfig,
      transpilePackages: gluestackUITranspileModules,
      webpack: (config: any) => {
        config = nextConfig.webpack ? nextConfig.webpack(config) : config;
  
        config.resolve.alias = {
          ...(config.resolve.alias || {}),
          'react-native$': 'react-native-web',
        };
  
        config.resolve.extensions = [
          '.web.js',
          '.web.ts',
          '.web.tsx',
          ...config.resolve.extensions,
        ];
  
        config.module.rules.push({
          test: /\.ttf$/,
          loader: 'url-loader',
        });
  
        return config;
      },
    };
  
    return updatedNextConfig;
  }
