import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Cloud } from 'lucide-react';
import { auth, User, FirebaseAuth } from '../firebaseConfig'; // Import the FirebaseAuth component
import { useAuthState } from 'react-firebase-hooks/auth';

 
interface CloudStorageConfig {
  provider: string;
  projectId?: string;
  keyFilename?: string;
  accountName?: string;
  accountKey?: string;
  containerName?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  bucketName?: string;
}

const CloudStorageDialog: React.FC = () => {
  const [cloudProvider, setCloudProvider] = useState<string>('')
  const [config, setConfig] = useState<CloudStorageConfig>({
    provider: '',
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const handleConfigChange = (key: keyof CloudStorageConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      // Here, you would implement the actual connection logic
      // This is a placeholder for the actual implementation
      await connectToCloudStorage(config)
      // If connection is successful, you can close the dialog and update the app state
      console.log('Connected successfully')
      // TODO: Update app state with connected status and loaded images
    } catch (error) {
      setConnectionError((error as Error).message)
    } finally {
      setIsConnecting(false)
    }
  }

  const renderProviderFields = () => {
    switch (cloudProvider) {
      case 'gcp':
        return (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectId" className="text-right">Project ID</Label>
            <Input
              id="projectId"
              value={config.projectId || ''}
              onChange={(e) => handleConfigChange('projectId', e.target.value)}
              className="col-span-3"
            />
          </div>
        );
      case 'azure':
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountName" className="text-right">Account Name</Label>
              <Input
                id="accountName"
                value={config.accountName || ''}
                onChange={(e) => handleConfigChange('accountName', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountKey" className="text-right">Account Key</Label>
              <Input
                id="accountKey"
                type="password"
                value={config.accountKey || ''}
                onChange={(e) => handleConfigChange('accountKey', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="containerName" className="text-right">Container Name</Label>
              <Input
                id="containerName"
                value={config.containerName || ''}
                onChange={(e) => handleConfigChange('containerName', e.target.value)}
                className="col-span-3"
              />
            </div>
          </>
        )
      case 'aws':
        return (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accessKeyId" className="text-right">Access Key ID</Label>
              <Input
                id="accessKeyId"
                value={config.accessKeyId || ''}
                onChange={(e) => handleConfigChange('accessKeyId', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secretAccessKey" className="text-right">Secret Access Key</Label>
              <Input
                id="secretAccessKey"
                type="password"
                value={config.secretAccessKey || ''}
                onChange={(e) => handleConfigChange('secretAccessKey', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">Region</Label>
              <Input
                id="region"
                value={config.region || ''}
                onChange={(e) => handleConfigChange('region', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bucketName" className="text-right">Bucket Name</Label>
              <Input
                id="bucketName"
                value={config.bucketName || ''}
                onChange={(e) => handleConfigChange('bucketName', e.target.value)}
                className="col-span-3"
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Cloud className="mr-2 h-4 w-4" />
          Cloud Storage
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Connect to Cloud Storage</DialogTitle>
          <DialogDescription>
            Choose a cloud provider and enter your connection details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cloudProvider" className="text-right">
              Provider
            </Label>
            <select
              id="cloudProvider"
              className="col-span-3"
              value={cloudProvider}
              onChange={(e) => {
                setCloudProvider(e.target.value)
                handleConfigChange('provider', e.target.value)
              }}
            >
              <option value="">Select a provider</option>
              <option value="gcp">Google Cloud Storage</option>
              <option value="azure">Azure Blob Storage</option>
              <option value="aws">Amazon S3</option>
            </select>
          </div>
          {renderProviderFields()}
        </div>
        {connectionError && (
          <p className="text-red-500 mb-4">{connectionError}</p>
        )}
        <Button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

// Placeholder function for cloud storage connection
// In a real application, this would be implemented with actual SDK calls
const connectToCloudStorage = async (config: CloudStorageConfig): Promise<void> => {
  // Simulating an asynchronous connection
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Simulating connection logic
  switch (config.provider) {
    case 'gcp':
      if (!config.projectId || !config.keyFilename) {
        throw new Error('Missing GCP configuration')
      }
      // Implement GCP connection logic
      break
    case 'azure':
      if (!config.accountName || !config.accountKey || !config.containerName) {
        throw new Error('Missing Azure configuration')
      }
      // Implement Azure connection logic
      break
    case 'aws':
      if (!config.accessKeyId || !config.secretAccessKey || !config.region || !config.bucketName) {
        throw new Error('Missing AWS configuration')
      }
      // Implement AWS connection logic
      break
    default:
      throw new Error('Invalid cloud provider')
  }

  // If connection is successful, you would typically return some kind of client or connection object
  // For this example, we're just resolving the promise
}

export default CloudStorageDialog