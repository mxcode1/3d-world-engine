#!/usr/bin/env node

/**
 * Advanced Vercel Integration Demo
 * 
 * This script demonstrates multiple ways to integrate with and monitor Vercel deployments:
 * 1. CLI-based monitoring
 * 2. API-based monitoring  
 * 3. Webhook integration
 * 4. Real-time log streaming
 */

const { execSync } = require('child_process');

class VercelIntegration {
  constructor(token = null) {
    this.token = token;
    this.baseUrl = 'https://api.vercel.com';
    this.projectName = '3d-world-engine-git';
  }

  // Method 1: CLI-based integration (what we've been doing)
  async getDeploymentsViaCLI() {
    try {
      const output = execSync('npx vercel ls --json', { encoding: 'utf8' });
      return JSON.parse(output);
    } catch (error) {
      console.error('CLI Error:', error.message);
      return null;
    }
  }

  // Method 2: API-based integration (requires token)
  async getDeploymentsViaAPI() {
    if (!this.token) {
      console.log('No API token provided. Get one from: https://vercel.com/account/tokens');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/v6/deployments?teamId=mxdevelopment-org`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error.message);
      return null;
    }
  }

  // Method 3: Environment variable management via API
  async getEnvironmentVariables() {
    if (!this.token) return this.getEnvViaCLI();

    try {
      const response = await fetch(`${this.baseUrl}/v9/projects/${this.projectName}/env`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Env API Error:', error.message);
      return this.getEnvViaCLI();
    }
  }

  // Fallback: CLI method for environment variables
  getEnvViaCLI() {
    try {
      const output = execSync('npx vercel env ls', { encoding: 'utf8' });
      return { source: 'cli', output };
    } catch (error) {
      console.error('CLI Env Error:', error.message);
      return null;
    }
  }

  // Method 4: Real-time monitoring
  async monitorDeployments(callback) {
    console.log('🔄 Starting deployment monitoring...');
    
    setInterval(async () => {
      const deployments = await this.getDeploymentsViaCLI();
      if (deployments && callback) {
        callback(deployments);
      }
    }, 10000); // Check every 10 seconds
  }

  // Method 5: Webhook simulation (for external integration)
  createWebhookHandler() {
    return {
      onDeploymentReady: (deployment) => {
        console.log('✅ Deployment ready:', deployment.url);
      },
      onDeploymentError: (deployment) => {
        console.log('❌ Deployment failed:', deployment.url);
        // Here you could trigger notifications, rollbacks, etc.
      },
      onBuildStart: (deployment) => {
        console.log('🔨 Build started for:', deployment.url);
      }
    };
  }

  // Method 6: Advanced debugging
  async debugDeployment(deploymentUrl) {
    console.log(`🔍 Debugging deployment: ${deploymentUrl}`);
    
    // 1. Get deployment info
    try {
      const inspectOutput = execSync(`npx vercel inspect ${deploymentUrl}`, { encoding: 'utf8' });
      console.log('📋 Deployment Info:\n', inspectOutput);
    } catch (error) {
      console.error('Inspect error:', error.message);
    }

    // 2. Check environment variables
    const envVars = await this.getEnvironmentVariables();
    console.log('🔧 Environment Variables:', envVars);

    // 3. Analyze build logs (if available)
    try {
      // Note: This would need the deployment to be in ready state
      const logs = execSync(`npx vercel logs ${deploymentUrl}`, { encoding: 'utf8' });
      console.log('📝 Logs:\n', logs);
    } catch (error) {
      console.log('ℹ️  Logs not available (deployment may be in error state)');
    }
  }
}

// Demo usage
async function demonstrateIntegration() {
  const integration = new VercelIntegration();
  
  console.log('🚀 Vercel Integration Demo\n');
  
  // 1. CLI-based deployment check
  console.log('1️⃣ Getting deployments via CLI...');
  const deployments = await integration.getDeploymentsViaCLI();
  console.log('Recent deployments:', deployments ? 'Found' : 'Error');
  
  // 2. Environment variables check
  console.log('\n2️⃣ Checking environment variables...');
  const envVars = await integration.getEnvironmentVariables();
  console.log('Environment variables:', envVars ? 'Retrieved' : 'Error');
  
  // 3. Debug latest deployment
  console.log('\n3️⃣ Debug latest deployment...');
  const latestDeployment = 'https://3d-world-engine-g34r1cnw2-mxdevelopment-org.vercel.app';
  await integration.debugDeployment(latestDeployment);
  
  console.log('\n✅ Integration demonstration complete!');
  console.log('\n📘 To enable full API integration:');
  console.log('   1. Create token at: https://vercel.com/account/tokens');
  console.log('   2. Pass token to VercelIntegration constructor');
  console.log('   3. Enjoy full programmatic control!');
}

// Export for use
module.exports = { VercelIntegration };

// Run demo if called directly
if (require.main === module) {
  demonstrateIntegration().catch(console.error);
}