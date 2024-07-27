const AWS = require('aws-sdk');
const { nanoid } = require('nanoid');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const { inputText, filePath } = JSON.parse(event.body);
  const id = nanoid();

  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      id,
      input_text: inputText,
      input_file_path: filePath,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ id }),
    };
  } catch (error) {
    console.error('Error saving data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not save data' }),
    };
  }
};
