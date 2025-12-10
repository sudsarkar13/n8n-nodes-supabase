import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

export interface SupabaseOrganization {
	id: string;
	name: string;
	slug: string;
	billing_email: string;
	created_at: string;
}

export interface SupabaseProject {
	id: string;
	ref: string;
	name: string;
	organization_id: string;
	created_at: string;
	updated_at: string;
	status: string;
	database: {
		host: string;
		version: string;
	};
	region: string;
}

export interface SupabaseTable {
	id: number;
	schema: string;
	name: string;
	rls_enabled: boolean;
	replica_identity: string;
	bytes: number;
	size: string;
	seq_scan_count: number;
	seq_tup_read: number;
	idx_scan_count: number;
	idx_tup_fetch: number;
	n_tup_ins: number;
	n_tup_upd: number;
	n_tup_del: number;
	n_tup_hot_upd: number;
	n_live_tup: number;
	n_dead_tup: number;
	n_mod_since_analyze: number;
	n_ins_since_vacuum: number;
	last_vacuum: string | null;
	last_autovacuum: string | null;
	last_analyze: string | null;
	last_autoanalyze: string | null;
	vacuum_count: number;
	autovacuum_count: number;
	analyze_count: number;
	autoanalyze_count: number;
}

export interface SupabaseColumn {
	table_id: number;
	schema: string;
	table: string;
	id: string;
	ordinal_position: number;
	name: string;
	default_value: string | null;
	data_type: string;
	format: string;
	description: string | null;
	is_identity: boolean;
	identity_generation: string | null;
	is_generated: boolean;
	is_nullable: boolean;
	is_updatable: boolean;
	is_unique: boolean;
	enums: string[];
	check: string | null;
	comment: string | null;
}

export class SupabaseManagementApiClient {
	private baseUrl = 'https://api.supabase.com/v1';
	private token: string;

	constructor(token: string) {
		this.token = token;
	}

	private async makeRequest<T>(endpoint: string): Promise<T> {
		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${this.token}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Management API request failed: ${response.status} ${response.statusText} - ${errorText}`);
		}

		return response.json();
	}

	async getOrganizations(): Promise<SupabaseOrganization[]> {
		return this.makeRequest<SupabaseOrganization[]>('/organizations');
	}

	async getProjects(organizationId?: string): Promise<SupabaseProject[]> {
		const endpoint = organizationId ? `/organizations/${organizationId}/projects` : '/projects';
		return this.makeRequest<SupabaseProject[]>(endpoint);
	}

	async getProject(projectRef: string): Promise<SupabaseProject> {
		return this.makeRequest<SupabaseProject>(`/projects/${projectRef}`);
	}

	async getTables(projectRef: string, schema: string = 'public'): Promise<SupabaseTable[]> {
		return this.makeRequest<SupabaseTable[]>(`/projects/${projectRef}/database/tables?schema=${schema}`);
	}

	async getColumns(projectRef: string, tableId?: number, schema: string = 'public'): Promise<SupabaseColumn[]> {
		const endpoint = tableId 
			? `/projects/${projectRef}/database/columns?table_id=${tableId}`
			: `/projects/${projectRef}/database/columns?schema=${schema}`;
		return this.makeRequest<SupabaseColumn[]>(endpoint);
	}

	// Helper method to extract project reference from URL
	static extractProjectRefFromUrl(url: string): string | null {
		try {
			const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
			return match && match[1] ? match[1] : null;
		} catch {
			return null;
		}
	}

	// Helper method to construct project URL from reference
	static constructProjectUrl(projectRef: string): string {
		return `https://${projectRef}.supabase.co`;
	}
}

// Helper functions for credential loadOptions methods
export async function getOrganizationsOptions(loadOptionsFunctions: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const credentials = await loadOptionsFunctions.getCredentials('supabaseApi');
		const additionalOptions = credentials.additionalOptions as any;
		const managementToken = additionalOptions?.managementToken as string;

		if (!managementToken) {
			return [{
				name: 'Management API token required',
				value: '',
				description: 'Please enable Management API features and provide a token',
			}];
		}

		const client = new SupabaseManagementApiClient(managementToken);
		const organizations = await client.getOrganizations();

		return organizations.map(org => ({
			name: org.name,
			value: org.id,
			description: `${org.slug} (${org.billing_email})`,
		}));

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return [{
			name: `Error: ${errorMessage}`,
			value: '',
			description: 'Failed to load organizations. Please check your Management API token.',
		}];
	}
}

export async function getProjectsOptions(loadOptionsFunctions: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const credentials = await loadOptionsFunctions.getCredentials('supabaseApi');
		const additionalOptions = credentials.additionalOptions as any;
		const managementToken = additionalOptions?.managementToken as string;

		if (!managementToken) {
			return [{
				name: 'Management API token required',
				value: '',
				description: 'Please enable Management API features and provide a token',
			}];
		}

		const client = new SupabaseManagementApiClient(managementToken);
		const projects = await client.getProjects();

		const options: INodePropertyOptions[] = projects.map(project => ({
			name: `${project.name} (${project.ref})`,
			value: project.ref,
			description: `Status: ${project.status} | Region: ${project.region} | Created: ${new Date(project.created_at).toLocaleDateString()}`,
		}));

		// Sort projects by name
		options.sort((a, b) => a.name.localeCompare(b.name));

		return options;

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return [{
			name: `Error: ${errorMessage}`,
			value: '',
			description: 'Failed to load projects. Please check your Management API token.',
		}];
	}
}

export async function getTablesOptions(loadOptionsFunctions: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const credentials = await loadOptionsFunctions.getCredentials('supabaseApi');
		const additionalOptions = credentials.additionalOptions as any;
		const managementToken = additionalOptions?.managementToken as string;
		const enableManagementApi = additionalOptions?.enableManagementApi as boolean;
		const schema = additionalOptions?.schema as string || 'public';

		// Try Management API first if available and enabled
		if (enableManagementApi && managementToken) {
			try {
				const host = credentials.host as string;
				const projectRef = SupabaseManagementApiClient.extractProjectRefFromUrl(host);
				
				if (projectRef) {
					const client = new SupabaseManagementApiClient(managementToken);
					const tables = await client.getTables(projectRef, schema);

					return tables.map(table => ({
						name: `${table.name}${table.rls_enabled ? ' (RLS)' : ''}`,
						value: table.name,
						description: `Schema: ${table.schema} | Size: ${table.size} | Live rows: ${table.n_live_tup}`,
					}));
				}
			} catch (managementError) {
				// Fall back to direct database query if Management API fails
				console.warn('Management API failed, falling back to direct query:', managementError);
			}
		}

		// Fallback to direct database query using project API key
		const host = credentials.host as string;
		const serviceKey = credentials.serviceKey as string;

		if (!host || !serviceKey) {
			return [{
				name: 'Project URL and API key required',
				value: '',
				description: 'Please provide project URL and API key to fetch tables',
			}];
		}

		// Try alternative approach using PostgREST schema endpoint
		const tablesResponse = await fetch(`${host}/rest/v1/`, {
			method: 'GET',
			headers: {
				'apikey': serviceKey,
				'Authorization': `Bearer ${serviceKey}`,
				'Accept': 'application/vnd.pgrst.object+json',
			},
		});

		if (tablesResponse.ok) {
			const schemaInfo = await tablesResponse.text();
			// Parse OpenAPI schema to extract table names
			const tableNames = extractTableNamesFromSchema(schemaInfo);
			return tableNames.map(name => ({
				name: name,
				value: name,
				description: `Table in ${schema} schema`,
			}));
		}

		throw new Error(`Failed to fetch tables: ${tablesResponse.status} ${tablesResponse.statusText}`);

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return [{
			name: `Error: ${errorMessage}`,
			value: '',
			description: 'Failed to load tables. Please check your credentials and connection.',
		}];
	}
}

export async function getColumnsOptions(loadOptionsFunctions: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const credentials = await loadOptionsFunctions.getCredentials('supabaseApi');
		const additionalOptions = credentials.additionalOptions as any;
		const managementToken = additionalOptions?.managementToken as string;
		const enableManagementApi = additionalOptions?.enableManagementApi as boolean;
		const schema = additionalOptions?.schema as string || 'public';

		// Get table name from node parameters
		const tableName = loadOptionsFunctions.getCurrentNodeParameter('table') as string;

		if (!tableName) {
			return [{
				name: 'Please select a table first',
				value: '',
				description: 'Table selection is required to load columns',
			}];
		}

		// Try Management API first if available and enabled
		if (enableManagementApi && managementToken) {
			try {
				const host = credentials.host as string;
				const projectRef = SupabaseManagementApiClient.extractProjectRefFromUrl(host);
				
				if (projectRef) {
					const client = new SupabaseManagementApiClient(managementToken);
					const tables = await client.getTables(projectRef, schema);
					const table = tables.find(t => t.name === tableName);

					if (table) {
						const columns = await client.getColumns(projectRef, table.id, schema);
						return columns
							.filter(col => col.table === tableName)
							.map(column => ({
								name: `${column.name} (${column.data_type})${column.is_nullable ? '' : ' *'}`,
								value: column.name,
								description: `Type: ${column.data_type} | ${column.is_nullable ? 'Nullable' : 'Required'}${column.description ? ` | ${column.description}` : ''}`,
							}));
					}
				}
			} catch (managementError) {
				console.warn('Management API failed for columns, falling back to direct query:', managementError);
			}
		}

		// Fallback: return basic message for columns since we can't easily query them without custom functions
		return [{
			name: 'Enter column name manually',
			value: '',
			description: `Enter column names for table "${tableName}" manually. Enable Management API for auto-discovery.`,
		}];

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return [{
			name: `Error: ${errorMessage}`,
			value: '',
			description: 'Failed to load columns. Please check your credentials and table selection.',
		}];
	}
}

// Helper function to extract table names from OpenAPI schema
function extractTableNamesFromSchema(schemaText: string): string[] {
	try {
		// Try to parse as JSON first
		const schema = JSON.parse(schemaText);
		if (schema.definitions) {
			return Object.keys(schema.definitions).filter(name => 
				!name.startsWith('rpc_') && // Exclude RPC functions
				!name.includes('_') || // Include tables with underscores
				name.match(/^[a-z][a-z0-9_]*$/) // Valid table name pattern
			);
		}
	} catch {
		// If JSON parsing fails, try regex extraction
		const tableMatches = schemaText.match(/"\/([a-z][a-z0-9_]*)":/g);
		if (tableMatches) {
			return tableMatches
				.map(match => match.replace(/["/":]/g, ''))
				.filter(name => !name.startsWith('rpc_'))
				.filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates
		}
	}
	return [];
}
