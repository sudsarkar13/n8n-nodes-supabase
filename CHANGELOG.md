# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-12-10

### BREAKING CHANGES
- **Removed Management API functionality completely** - This is a major simplification that removes all Management API features to focus on core Supabase operations

### Removed
- Management API integration and all related code (341 lines removed)
- Auto-discovery of tables and columns via Management API
- Management API token configuration in credentials
- `enableManagementApi` and `managementToken` credential fields
- Organization and project listing features
- Complex fallback logic for table/column loading
- `nodes/Supabase/utils/managementApi.ts` file entirely

### Changed
- **BREAKING**: Table field is now a simple text input instead of dropdown with loadOptions
- **BREAKING**: Column names must be entered manually instead of auto-populated
- Simplified credential configuration - only Host, Service Role Secret, and Schema remain
- Reduced bundle size significantly (~300+ lines of code removed)
- Improved reliability by removing complex Management API authentication flows

### Benefits
- Significantly simplified codebase and reduced complexity
- Faster load times (no Management API calls)
- More reliable credential system
- Easier maintenance and debugging
- Reduced potential for authentication issues
- Smaller bundle size

### Migration Guide
Users upgrading from v1.1.x to v1.2.0:
1. **Table names**: Previously auto-populated table dropdown now requires manual entry
2. **Column names**: Must be entered manually in column fields
3. **Credentials**: Remove any Management API tokens from existing credentials (they will be ignored)
4. **Functionality**: All core database and storage operations remain fully functional

**Note**: This version focuses on core Supabase functionality while removing the experimental Management API features that were causing authentication complexity.

## [1.1.2] - 2024-12-10

### Fixed

- **Authorization Issues**: Fixed "Authorization failed - please check your credentials" error
- **Credential Testing**: Simplified credential test to match default n8n Supabase approach
- **API Compatibility**: Updated authentication headers and request format for better compatibility
- **Management API Integration**: Made Management API features optional with fallback to basic functionality
- **Credential Structure**: Streamlined credential configuration to follow n8n standards

### Changed

- Simplified credential structure to match default n8n Supabase credentials (Host + Service Role Secret)
- Made Management API features optional through "Enable Management API Features" checkbox
- Updated credential test endpoint to use proper PostgREST format
- Improved error handling and fallback mechanisms for table/bucket discovery

### Technical

- Updated credential authentication to use standard n8n patterns
- Fixed credential test configuration with proper Accept headers
- Simplified loadOptions methods with better error handling
- Enhanced compatibility with existing n8n Supabase workflows

## [1.0.0] - 2024-12-09

### Added

#### Database Operations

- **Enhanced CRUD Operations**: Complete Create, Read, Update, Delete, and Upsert operations
- **Schema Management**: Create/drop tables, add/remove columns, create/drop indexes
- **Custom SQL Queries**: Execute any SQL query with proper error handling
- **Advanced Filtering**: Support for multiple filter operators (eq, neq, gt, gte, lt, lte, like, ilike, is, in, cs, cd)
- **Flexible Sorting**: Multi-column sorting with ascending/descending options
- **Pagination Support**: Limit and offset parameters for large datasets
- **Dual UI Modes**: Simple form-based interface and advanced JSON mode

#### Storage Operations

- **File Upload**: Support for binary data, URL downloads, and text content
- **File Download**: Download files as binary data or text content
- **File Management**: List, delete, move, and copy files with advanced options
- **Bucket Management**: Create, delete, and list storage buckets
- **File Metadata**: Get detailed file information and manage metadata
- **Signed URLs**: Generate time-limited access URLs with customizable expiration
- **Advanced File Listing**: Search, filter, and sort files with pagination

#### Technical Features

- **Comprehensive Error Handling**: Detailed error messages and validation
- **TypeScript Support**: Full TypeScript implementation with proper type definitions
- **Connection Management**: Efficient Supabase client handling with validation
- **Security**: Support for both anon and service role keys with RLS consideration
- **Performance**: Optimized query building and efficient data handling

#### User Experience

- **Intuitive UI**: Clean, organized interface with contextual field visibility
- **Validation**: Input validation for table names, column names, and data formats
- **Documentation**: Comprehensive inline help and parameter descriptions
- **Error Recovery**: Graceful error handling with actionable error messages

### Technical Implementation

- Built with TypeScript for type safety and better developer experience
- Modular architecture with separate modules for database and storage operations
- Comprehensive utility functions for validation and error handling
- Support for n8n's binary data handling and workflow integration
- Proper credential management with secure API key handling

### Breaking Changes

- This is the initial release, no breaking changes from previous versions

### Migration Guide

If migrating from the built-in n8n Supabase node:

1. Database operations should work with minimal changes
2. Storage operations are completely new - refer to documentation for usage
3. Advanced features like schema management require the service role key
4. Filter syntax is enhanced but backward compatible

### Known Issues

- Schema management operations require service role key
- Large file uploads may timeout on slower connections
- Custom SQL queries need proper escaping for user inputs

### Dependencies

- `@supabase/supabase-js`: ^2.38.0
- `form-data`: ^4.0.0
- `mime-types`: ^2.1.35

---

## Future Roadmap

### Planned for v1.1.0

- [ ] Realtime subscriptions support
- [ ] Batch operations for improved performance
- [ ] Advanced file transformation options
- [ ] Enhanced error recovery mechanisms
- [ ] Performance monitoring and metrics

### Planned for v1.2.0

- [ ] Authentication operations (user management)
- [ ] Edge Functions integration
- [ ] Advanced RLS policy management
- [ ] Database migration tools
- [ ] Backup and restore operations

### Long-term Goals

- [ ] Visual query builder
- [ ] Database schema visualization
- [ ] Performance optimization suggestions
- [ ] Advanced caching mechanisms
- [ ] Multi-project management

---

## Support

For questions, issues, or feature requests:

- 📖 [Documentation](https://github.com/yourusername/n8n-nodes-supabase/wiki)
- 🐛 [Bug Reports](https://github.com/yourusername/n8n-nodes-supabase/issues)
- 💡 [Feature Requests](https://github.com/yourusername/n8n-nodes-supabase/discussions)
- 💬 [Community Discord](https://discord.gg/n8n)
