# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
