import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class FileUploadProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a unique bucket name using the current timestamp
    const timestamp = Date.now();

    // S3 bucket for file uploads
    const bucket = new s3.Bucket(this, 'FileUploadBucket', {
      bucketName: `my-bucket-caltannguyen-2024-${timestamp}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // DynamoDB table to store file metadata
    const table = new dynamodb.Table(this, 'FileTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda function for saving file metadata
    const saveInputsLambda = new lambda.Function(this, 'SaveInputsFunction', {
      runtime: lambda.Runtime.NODEJS_10_X, 
      code: lambda.Code.fromAsset('lambda'),
      handler: 'saveInputs.handler',
      environment: {
        TABLE_NAME: table.tableName,
        BUCKET_NAME: bucket.bucketName,
      },
    });

    // Grant necessary permissions to the Lambda function
    table.grantReadWriteData(saveInputsLambda);
    bucket.grantPut(saveInputsLambda);

    // API Gateway to expose the Lambda function
    const api = new apigateway.RestApi(this, 'FileUploadApi', {
      restApiName: 'File Upload Service',
      description: 'Handles file uploads.',
    });

    const postIntegration = new apigateway.LambdaIntegration(saveInputsLambda);
    const items = api.root.addResource('items');
    items.addMethod('POST', postIntegration);

    // VPC for the EC2 instance
    const vpc = new ec2.Vpc(this, 'FileUploadVpc');

    // EC2 instance within the VPC
    const instance = new ec2.Instance(this, 'FileUploadInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux(),
      keyName: 'your-key-pair', // Replace with your actual key pair name
    });

    // Additional resources and permissions can be added here as needed
  }
}
