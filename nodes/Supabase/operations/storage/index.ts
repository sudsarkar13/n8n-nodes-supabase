import { SupabaseClient } from '@supabase/supabase-js';
import { IDataObject, IExecuteFunctions, INodeExecutionData, IBinaryData } from 'n8n-workflow';
import {
	IFileUploadOptions,
	IFileListOptions,
	IStorageFile,
	IStorageBucket,
	StorageOperation,
} from '../../types';
import { formatSupabaseError } from '../../utils/supabaseClient';
import * as fs from 'fs';
import * as path from 'path';
import { lookup } from 'mime-types';

/**
 * Execute storage operations
 */
export async function executeStorageOperation(
	this: IExecuteFunctions,
	supabase: SupabaseClient,
	operation: StorageOperation,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	try {
		switch (operation) {
			case 'uploadFile':
				returnData.push(...await handleUploadFile.call(this, supabase, itemIndex));
				break;
			case 'downloadFile':
				returnData.push(...await handleDownloadFile.call(this, supabase, itemIndex));
				break;
			case 'listFiles':
				returnData.push(...await handleListFiles.call(this, supabase, itemIndex));
				break;
			case 'deleteFile':
				returnData.push(...await handleDeleteFile.call(this, supabase, itemIndex));
				break;
			case 'moveFile':
				returnData.push(...await handleMoveFile.call(this, supabase, itemIndex));
				break;
			case 'copyFile':
				returnData.push(...await handleCopyFile.call(this, supabase, itemIndex));
				break;
			case 'createBucket':
				returnData.push(...await handleCreateBucket.call(this, supabase, itemIndex));
				break;
			case 'deleteBucket':
				returnData.push(...await handleDeleteBucket.call(this, supabase, itemIndex));
				break;
			case 'listBuckets':
				returnData.push(...await handleListBuckets.call(this, supabase, itemIndex));
				break;
			case 'getBucketDetails':
				returnData.push(...await handleGetBucketDetails.call(this, supabase, itemIndex));
				break;
			case 'getFileInfo':
				returnData.push(...await handleGetFileInfo.call(this, supabase, itemIndex));
				break;
			case 'generateSignedUrl':
				returnData.push(...await handleGenerateSignedUrl.call(this, supabase, itemIndex));
				break;
			default:
				throw new Error(`Unknown storage operation: ${operation}`);
		}
	} catch (error) {
		throw new Error(`Storage operation failed: ${formatSupabaseError(error)}`);
	}

	return returnData;
}

/**
 * Handle UPLOAD FILE operation
 */
async function handleUploadFile(
	this: IExecuteFunctions,
	supabase: SupabaseClient,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const bucket = this.getNodeParameter('bucket', itemIndex) as string;
	const fileName = this.getNodeParameter('fileName', itemIndex) as string;
	const inputType = this.getNodeParameter('inputType', itemIndex, 'binary') as string;
	
	if (!bucket || !fileName) {
		throw new Error('Bucket name and file name are required');
	}

	let fileData: Buffer;
	let contentType: string | undefined;

	if (inputType === 'binary') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data') as string;
		const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
		
		fileData = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
		contentType = binaryData.mimeType;
	} else if (inputType === 'url') {
		const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
		
		// Download file from URL
		const response = await this.helpers.httpRequest({
			method: 'GET',
			url: fileUrl,
			encoding: 'arraybuffer', // Return as Buffer
		});
		
		fileData = response.body;
		contentType = response.headers['content-type'] || lookup(fileName) || 'application/octet-stream';
	} else {
		// Text input
		const textContent = this.getNodeParameter('textContent', itemIndex) as string;
		fileData = Buffer.from(textContent, 'utf-8');
		contentType = 'text/plain';
	}

	// Get upload options
	const options: IFileUploadOptions = {};
	const cacheControl = this.getNodeParameter('cacheControl', itemIndex, '') as string;
	const upsert = this.getNodeParameter('upsert', itemIndex, false) as boolean;
	const customContentType = this.getNodeParameter('contentType', itemIndex, '') as string;
	
	if (cacheControl) options.cacheControl = cacheControl;
	if (upsert) options.upsert = upsert;
	if (customContentType) options.contentType = customContentType;
	else if (contentType) options.contentType = contentType;

	// Add metadata if provided
	const metadata = this.getNodeParameter('metadata', itemIndex, '') as string;
	if (metadata) {
		try {
			options.metadata = JSON.parse(metadata);
		} catch {
			throw new Error('Invalid metadata JSON');
		}
	}

	const { data, error } = await supabase.storage
		.from(bucket)
		.upload(fileName, fileData, options);

	if (error) {
		throw new Error(formatSupabaseError(error));
	}

	return [{
		json: {
			operation: 'uploadFile',
			bucket,
			fileName,
			path: data?.path,
			id: data?.id,
			fullPath: data?.fullPath,
			success: true,
		},
	}];
}

/**
 * Handle DOWNLOAD FILE operation
 */
async function handleDownloadFile(
	this: IExecuteFunctions,
	supabase: SupabaseClient,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const bucket = this.getNodeParameter('bucket', itemIndex) as string;
	const filePath = this.getNodeParameter('filePath', itemIndex) as string;
	const outputFormat = this.getNodeParameter('outputFormat', itemIndex, 'binary') as string;
	
	if (!bucket || !filePath) {
		throw new Error('Bucket name and file path are required');
	}

	const { data, error } = await supabase.storage
		.from(bucket)
		.download(filePath);

	if (error) {
		throw new Error(formatSupabaseError(error));
	}

	if (!data) {
		throw new Error('No file data received');
	}

	if (outputFormat === 'binary') {
		// Convert blob to buffer and return as binary data
		const buffer = Buffer.from(await data.arrayBuffer());
		const fileName = path.basename(filePath);
		const mimeType = data.type || lookup(fileName) || 'application/octet-stream';

		const binaryData: IBinaryData = {
			data: buffer.toString('base64'),
			mimeType,
			fileName,
		};

		return [{
			json: {
				operation: 'downloadFile',
				bucket,
				filePath,
				fileName,
				size: buffer.length,
				mimeType,
			},
			binary: {
				data: binaryData,
			},
		}];
	} else {
		// Return as text
		const text = await data.text();
		return [{
			json: {
				operation: 'downloadFile',
				bucket,
				filePath,
				content: text,
				size: data.size,
				type: data.type,
			},
		}];
	}
}

/**
 * Handle LIST FILES operation
 */
async function handleListFiles(
	this: IExecuteFunctions,
	supabase: SupabaseClient,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const bucket = this.getNodeParameter('bucket', itemIndex) as string;
	const folderPath = this.getNodeParameter('folderPath', itemIndex, '') as string;
	
	if (!bucket) {
		throw new Error('Bucket name is required');
	}

	// Get list options
	const limit = this.getNodeParameter('limit', itemIndex, undefined) as number | undefined;
	const offset = this.getNodeParameter('offset', itemIndex, undefined) as number | undefined;
	const search = this.getNodeParameter('search', itemIndex, '') as string;
	const sortColumn = this.getNodeParameter('sortColumn', itemIndex, 'name') as string;
	const sortOrder = this.getNodeParameter('sortOrder', itemIndex, 'asc') as string;

	const options: any = {};
	if (limit !== undefined) options.limit = limit;
	if (offset !== undefined) options.offset = offset;
	if (search) options.search = search;
	if (sortColumn && sortOrder) {
		options.sortBy = { column: sortColumn, order: sortOrder };
	}

	const { data, error } = await supabase.storage
		.from(bucket)
		.list(folderPath, options);

	if (error) {
		throw new Error(formatSupabaseError(error));
	}

	const returnData: INodeExecutionData[] = [];
	
	if (Array.isArray(data)) {
		for (const file of data) {
			returnData.push({
				json: {
					...file,
					bucket,
					folderPath,
				},
			});
		}
	}

	if (returnData.length === 0) {
		returnData.push({
			json: {
				operation: 'listFiles',
				bucket,
				folderPath,
				files: [],
				count: 0,
				message: 'No files found',
			},
		});
	}

	return returnData;
}

/**
 * Handle DELETE FILE operation
 */
async function handleDeleteFile(
	this: IExecuteFunctions,
	supabase: SupabaseClient,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const bucket = this.getNodeParameter('bucket', itemIndex) as string;
	const filePaths = this.getNodeParameter('filePaths', itemIndex) as string | string[];
	
	if (!bucket || !filePaths) {
		throw new Error('Bucket name and file path(s) are required');
	}

	// Convert single path to array
	const pathsArray = Array.isArray(filePaths) ? filePaths : [filePaths];

	const { data, error } = await supabase.storage
		.from(bucket)
		.remove(pathsArray);

	if (error) {
		throw new Error(formatSupabaseError(error));
	}

	return [{
		json: {
			operation: 'deleteFile',
			bucket,
			deletedFiles: pathsArray,
			result: data,
			success: true,
		},
	}];
}

/**
 * Handle MOVE FILE operation
 */
async function handleMoveFile(
	this: IExecuteFunctions,
	supabase: SupabaseClient,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const bucket = this.getNodeParameter('bucket', itemIndex) as string;
	const fromPath = this.getNodeParameter('fromPath', itemIndex) as string;
	const toPath = this.getNodeParameter('toPath', itemIndex) as string;
	
	if (!bucket || !fromPath || !toPath) {
		throw new Error('Bucket name, source path, and destination path are required');
	}

	const { data, error } = await supabase.storage
		.from(bucket)
		.move(fromPath, toPath);

	if (error) {
		throw new Error(formatSupabaseError(error));
	}

	return [{
		json: {
			operation: 'moveFile',
			bucket,
			fromPath,
			toPath,
			result: data,
			success: true,
		},
	}];
}

/**
 * Handle COPY FILE operation
 */
async function handleCopyFile(
	this: IExecuteFunctions,
	supabase: SupabaseClient,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const bucket = this.getNodeParameter('bucket', itemIndex) as string;
	const fromPath = this.getNodeParameter('fromPath', itemIndex) as string;
	const toPath = this.getNodeParameter('toPath', itemIndex) as string;
	
	if (!bucket || !fromPath || !toPath) {
		throw new Error('Bucket name, source path, and destination path are required');
	}

	const { data, error } = await supabase.storage
		.from(bucket)
		.copy(fromPath, toPath);

	if (error) {
		throw new Error(formatSupabaseError(error));
	}

	return [{
		json: {
			operation: 'copyFile',
			bucket,
			fromPath,
			toPath,
			result: data,
			success: true,
		},
	}];
}

/**
 * Handle CREATE BUCKET operation
 */
async function handleCreateBucket(
	this: IExecuteFunctions,
	supabase: SupabaseClient,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const bucketName = this.getNodeParameter('bucketName', itemIndex) as string;
	const isPublic = this.getNodeParameter('isPublic', itemIndex, false) as boolean;
	const fileSizeLimit = this.getNodeParameter('fileSizeLimit', itemIndex, undefined) as number | undefined;
	const allowedMimeTypes = this.getNodeParameter('allowedMimeTypes', itemIndex, '') as string;
	
	if (!bucketName) {
		throw new Error('Bucket name is required');
	}

	const options: any = {
		public: isPublic,
	};

	if (fileSizeLimit !== undefined) {
		options.fileSizeLimit = fileSizeLimit;
	}

	if (allowedMimeTypes) {
		try {
			options.allowedMimeTypes = allowedMimeTypes.split(',').map(type => type.trim());
		} catch {
			throw new Error('Invalid allowed MIME types format');
		}
	}

	const { data, error } = await supabase.storage.createBucket(bucketName, options);

	if (error) {
		throw new Error(formatSupabaseError(error));
	}

	return [{
		json: {
			operation: 'createBucket',
			bucketName,
			options,
			result: data,
			success: true,
		},
	}];
}

/**
 * Handle DELETE BUCKET operation
 */
async function handleDeleteBucket(
	this: IExecuteFunctions,
	supabase: SupabaseClient,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const bucketName = this.getNodeParameter('bucketName', itemIndex) as string;
	
	if (!bucketName) {
		throw new Error('Bucket name is required');
	}

	const { data, error } = await supabase.storage.deleteBucket(bucketName);

	if (error) {
		throw new Error(formatSupabaseError(error));
	}

	return [{
		json: {
			operation: 'deleteBucket',
			bucketName,
			result: data,
			success: true,
		},
	}];
}

/**
 * Handle LIST BUCKETS operation
 */
async function handleListBuckets(
	this: IExecuteFunctions,
	supabase: SupabaseClient,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const { data, error } = await supabase.storage.listBuckets();

	if (error) {
		throw new Error(formatSupabaseError(error));
	}

	const returnData: INodeExecutionData[] = [];
	
	if (Array.isArray(data)) {
		for (const bucket of data) {
			returnData.push({ json: bucket as any });
		}
	}

	if (returnData.length === 0) {
		returnData.push({
			json: {
				operation: 'listBuckets',
				buckets: [],
				count: 0,
				message: 'No buckets found',
			},
		});
	}

	return returnData;
}

/**
 * Handle GET BUCKET DETAILS operation
 */
async function handleGetBucketDetails(
	this: IExecuteFunctions,
	supabase: SupabaseClient,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const bucketName = this.getNodeParameter('bucketName', itemIndex) as string;
	
	if (!bucketName) {
		throw new Error('Bucket name is required');
	}

	const { data, error } = await supabase.storage.getBucket(bucketName);

	if (error) {
		throw new Error(formatSupabaseError(error));
	}

	return [{
		json: {
			operation: 'getBucketDetails',
			bucketName,
			...data,
		},
	}];
}

/**
 * Handle GET FILE INFO operation
 */
async function handleGetFileInfo(
	this: IExecuteFunctions,
	supabase: SupabaseClient,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const bucket = this.getNodeParameter('bucket', itemIndex) as string;
	const filePath = this.getNodeParameter('filePath', itemIndex) as string;
	
	if (!bucket || !filePath) {
		throw new Error('Bucket name and file path are required');
	}

	// Get file info by listing the specific file
	const { data, error } = await supabase.storage
		.from(bucket)
		.list(path.dirname(filePath), {
			search: path.basename(filePath),
		});

	if (error) {
		throw new Error(formatSupabaseError(error));
	}

	const fileInfo = data?.find(file => file.name === path.basename(filePath));
	
	if (!fileInfo) {
		throw new Error('File not found');
	}

	return [{
		json: {
			operation: 'getFileInfo',
			bucket,
			filePath,
			...fileInfo,
		},
	}];
}

/**
 * Handle GENERATE SIGNED URL operation
 */
async function handleGenerateSignedUrl(
	this: IExecuteFunctions,
	supabase: SupabaseClient,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const bucket = this.getNodeParameter('bucket', itemIndex) as string;
	const filePath = this.getNodeParameter('filePath', itemIndex) as string;
	const expiresIn = this.getNodeParameter('expiresIn', itemIndex, 3600) as number;
	const download = this.getNodeParameter('download', itemIndex, false) as boolean;
	
	if (!bucket || !filePath) {
		throw new Error('Bucket name and file path are required');
	}

	const options: any = { download };

	const { data, error } = await supabase.storage
		.from(bucket)
		.createSignedUrl(filePath, expiresIn, options);

	if (error) {
		throw new Error(formatSupabaseError(error));
	}

	return [{
		json: {
			operation: 'generateSignedUrl',
			bucket,
			filePath,
			expiresIn,
			download,
			signedUrl: data?.signedUrl,
			// Note: path and token may not be available in all Supabase versions
			...(data && 'path' in data ? { path: data.path as string } : {}),
			...(data && 'token' in data ? { token: data.token as string } : {}),
		} as any,
	}];
}
