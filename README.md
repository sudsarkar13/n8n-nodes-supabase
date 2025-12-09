# n8n-nodes-supabase

A comprehensive n8n community node for Supabase that provides both database and storage operations with enhanced functionality beyond the built-in Supabase node.

![n8n](https://img.shields.io/badge/n8n-community%20node-FF6D5A)
![npm](https://img.shields.io/npm/v/n8n-nodes-supabase)
![License](https://img.shields.io/npm/l/n8n-nodes-supabase)

## Features

### Database Operations

- **Enhanced CRUD Operations**: Create, Read, Update, Delete, and Upsert with advanced filtering
- **Schema Management**: Create/drop tables, add/remove columns, manage indexes
- **Custom SQL Queries**: Execute any SQL query directly
- **Advanced Filtering**: Support for complex filters and sorting
- **Dual UI Modes**: Simple form-based UI and advanced JSON mode

### Storage Operations

- **File Management**: Upload, download, list, delete, move, and copy files
- **Multiple Upload Types**: Binary data, URL downloads, or text content
- **Bucket Management**: Create, delete, and manage storage buckets
- **Signed URLs**: Generate time-limited access URLs
- **File Metadata**: Get detailed file information and manage metadata

### Key Improvements Over Built-in Node

- ✅ Complete storage operations support
- ✅ Schema management capabilities  
- ✅ Advanced filtering and sorting
- ✅ Dual UI modes (simple + advanced)
- ✅ Better error handling and validation
- ✅ Comprehensive file operations
- ✅ Bucket management
- ✅ Custom SQL query execution

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Click **Install a community node**
3. Enter: `n8n-nodes-supabase`
4. Click **Install**

### Manual Installation

```bash
# In your n8n installation directory
npm install n8n-nodes-supabase
```

### Docker

Add to your n8n Docker environment:

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_COMMUNITY_PACKAGES="n8n-nodes-supabase" \
  n8nio/n8n
```

## Setup

### 1. Create Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **API**
4. Copy your **Project URL** and **API Key**

### 2. Configure in n8n

1. Create a new **Supabase API** credential
2. Enter your **Project URL** (e.g., `https://your-project.supabase.co`)
3. Choose **API Key Type**:
   - **Anon Key**: For client-side operations with RLS
   - **Service Role Key**: For server-side operations (bypasses RLS)
4. Enter your **API Key**

## Usage Examples

### Database Operations

#### Create a Record

```javascript
// Simple Mode
Resource: Database
Operation: Create
Table: users
Columns:
  - name: John Doe
  - email: john@example.com
  - age: 30

// Advanced Mode  
Resource: Database
Operation: Create
Table: users
JSON Data: {
  "name": "John Doe",
  "email": "john@example.com", 
  "age": 30
}
```

#### Read with Filters

```javascript
// Simple Mode
Resource: Database
Operation: Read
Table: users
Filters:
  - Column: age, Operator: Greater Than, Value: 25
  - Column: status, Operator: Equals, Value: active
Return Fields: id,name,email
Limit: 10

// Advanced Mode
Resource: Database
Operation: Read  
Table: users
Advanced Filters: {
  "age": {"gt": 25},
  "status": "active"
}
```

#### Create Table

```javascript
Resource: Database
Operation: Create Table
Table Name: products
Column Definitions:
  - Name: id, Type: uuid, Primary Key: true, Default: gen_random_uuid()
  - Name: name, Type: varchar(255), Nullable: false
  - Name: price, Type: decimal(10,2), Nullable: false
  - Name: created_at, Type: timestamptz, Default: now()
```

### Storage Operations

#### Upload File

```javascript
Resource: Storage
Operation: Upload File
Bucket: documents
File Name: report.pdf
Input Type: Binary Data
Binary Property Name: data
```

#### Download File

```javascript
Resource: Storage
Operation: Download File
Bucket: documents  
File Path: reports/monthly-report.pdf
Output Format: Binary Data
```

#### List Files

```javascript
Resource: Storage
Operation: List Files
Bucket: images
Folder Path: avatars/
Limit: 50
Sort Column: created_at
Sort Order: desc
```

#### Create Bucket

```javascript
Resource: Storage
Operation: Create Bucket
Bucket Name: user-uploads
Public Bucket: false
File Size Limit: 10485760  // 10MB
Allowed MIME Types: image/jpeg,image/png,image/gif
```

## API Reference

### Database Operations

| Operation | Description | Parameters |
|-----------|-------------|------------|
| `create` | Insert new row | table, data (columns or JSON) |
| `read` | Select rows | table, filters, sort, limit, offset |
| `update` | Update existing rows | table, data, filters |
| `delete` | Delete rows | table, filters |
| `upsert` | Insert or update | table, data, onConflict |
| `createTable` | Create new table | tableName, columnDefinitions |
| `dropTable` | Drop table | tableName, cascade |
| `addColumn` | Add column | tableName, columnDefinition |
| `dropColumn` | Drop column | tableName, columnName |
| `createIndex` | Create index | tableName, indexDefinition |
| `dropIndex` | Drop index | indexName |
| `customQuery` | Execute SQL | customSql |

### Storage Operations

| Operation | Description | Parameters |
|-----------|-------------|------------|
| `uploadFile` | Upload file | bucket, fileName, inputType, data |
| `downloadFile` | Download file | bucket, filePath, outputFormat |
| `listFiles` | List files | bucket, folderPath, options |
| `deleteFile` | Delete files | bucket, filePaths |
| `moveFile` | Move file | bucket, fromPath, toPath |
| `copyFile` | Copy file | bucket, fromPath, toPath |
| `createBucket` | Create bucket | bucketName, options |
| `deleteBucket` | Delete bucket | bucketName |
| `listBuckets` | List buckets | - |
| `getBucketDetails` | Get bucket info | bucketName |
| `getFileInfo` | Get file info | bucket, filePath |
| `generateSignedUrl` | Create signed URL | bucket, filePath, expiresIn |

## Advanced Features

### Row Level Security (RLS)

The node respects Supabase's Row Level Security policies:

- **Anon Key**: Operates within RLS policies
- **Service Role Key**: Bypasses RLS (use with caution)

### Error Handling

Comprehensive error handling with detailed messages:

```javascript
// Automatic retry on network errors
// Validation of table/column names
// Clear error messages for debugging
// Support for n8n's "Continue on Fail" option
```

### Performance Optimization

- Connection pooling
- Efficient query building
- Batch operations support
- Proper indexing recommendations

## Troubleshooting

### Common Issues

#### 1. "Invalid credentials" Error

- Verify your Project URL format: `https://your-project.supabase.co`
- Check API key type matches your use case
- Ensure API key has required permissions

#### 2. "Table not found" Error

- Verify table name spelling and case
- Check if table exists in correct schema
- Ensure API key has access to the table

#### 3. Storage Upload Fails

- Verify bucket exists and is accessible
- Check file size limits
- Ensure proper MIME type configuration
- Verify RLS policies for storage

#### 4. RLS Policy Errors

- Use Service Role key to bypass RLS for testing
- Check your RLS policies in Supabase dashboard
- Ensure authenticated user has proper permissions

### Debug Mode

Enable detailed logging in n8n settings to see:

- Full SQL queries generated
- Supabase API responses
- Error stack traces
- Performance metrics

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/n8n-nodes-supabase.git
cd n8n-nodes-supabase

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Link for local development
npm link
cd ~/.n8n/nodes
npm link n8n-nodes-supabase
```

### Testing

```bash
# Run unit tests
npm run test

# Run integration tests (requires Supabase project)
SUPABASE_URL=your-url SUPABASE_KEY=your-key npm run test:integration

# Run with coverage
npm run test:cov
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## License

[MIT](LICENSE) - see LICENSE file for details.

## Support

- 📖 [Documentation](https://github.com/yourusername/n8n-nodes-supabase/wiki)
- 🐛 [Bug Reports](https://github.com/yourusername/n8n-nodes-supabase/issues)
- 💡 [Feature Requests](https://github.com/yourusername/n8n-nodes-supabase/discussions)
- 💬 [Community Discord](https://discord.gg/n8n)

## Related Projects

- [n8n](https://n8n.io) - Workflow automation platform
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

---

Made with ❤️ by the n8n community
