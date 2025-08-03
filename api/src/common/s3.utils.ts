import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function generateSignedUrl(s3Path: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = `aws s3 presign ${s3Path} --expires-in ${expiresIn}`;
    const { stdout } = await execAsync(command);
    return stdout.trim();
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

export function isS3Url(url: string): boolean {
  return url.startsWith('s3://');
}