#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FileUploadProjectStack } from '../lib/file-upload-project-stack';

const app = new cdk.App();
new FileUploadProjectStack(app, 'FileUploadProjectStack');
