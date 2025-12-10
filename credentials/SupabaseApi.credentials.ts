import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

import { 
	getOrganizationsOptions, 
	getProjectsOptions, 
	SupabaseManagementApiClient 
} from '../nodes/Supabase/utils/managementApi';

export class SupabaseApi implements ICredentialType {
	name = 'supabaseApi';

	displayName = 'Supabase API';

	documentationUrl = 'https://supabase.com/docs/reference/javascript/introduction';

	properties: INodeProperties[] = [
		{
			displayName: 'Connection Mode',
			name: 'connectionMode',
			type: 'options',
			options: [
				{
					name: 'Auto-Discovery',
					value: 'auto',
					description: 'Use Management API to auto-discover projects and resources',
				},
				{
					name: 'Manual Entry',
					value: 'manual',
					description: 'Enter project details manually',
				},
			],
			default: 'manual',
			description: 'Choose how to configure your Supabase connection',
		},

		// Auto-Discovery Mode Fields
		{
			displayName: 'Management API Token',
			name: 'managementToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					connectionMode: ['auto'],
				},
			},
			default: '',
			placeholder: 'sbp_xxxxxxxxxxxxxxxxxxxx',
			description: 'Your Supabase Management API token. Get this from your Supabase dashboard under Account Settings > Access Tokens.',
		},
		{
			displayName: 'Organization',
			name: 'organizationId',
			type: 'options',
			typeOptions: {
				loadOptionsMethod: 'getOrganizations',
			},
			displayOptions: {
				show: {
					connectionMode: ['auto'],
				},
			},
			default: '',
			description: 'Select your Supabase organization',
		},
		{
			displayName: 'Project',
			name: 'projectRef',
			type: 'options',
			typeOptions: {
				loadOptionsMethod: 'getProjects',
			},
			displayOptions: {
				show: {
					connectionMode: ['auto'],
				},
			},
			default: '',
			description: 'Select your Supabase project',
		},
		{
			displayName: 'Project URL',
			name: 'host',
			type: 'string',
			displayOptions: {
				show: {
					connectionMode: ['auto'],
				},
			},
			default: '',
			placeholder: 'https://your-project.supabase.co',
			description: 'Auto-populated from selected project. You can override this if needed.',
		},

		// Manual Entry Mode Fields
		{
			displayName: 'Project URL',
			name: 'host',
			type: 'string',
			displayOptions: {
				show: {
					connectionMode: ['manual'],
				},
			},
			default: '',
			placeholder: 'https://your-project.supabase.co',
			required: true,
			description: 'Your Supabase project URL',
		},
		{
			displayName: 'API Key Type',
			name: 'keyType',
			type: 'options',
			options: [
				{
					name: 'Anon Key (Public)',
					value: 'anon',
					description: 'Public anon key for client-side operations with RLS',
				},
				{
					name: 'Service Role Key (Private)',
					value: 'service_role',
					description: 'Private service role key with full access (bypasses RLS)',
				},
			],
			default: 'anon',
			required: true,
			description: 'Type of API key to use for authentication',
		},
		{
			displayName: 'API Key',
			name: 'serviceKey',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			required: true,
			description: 'Your Supabase API key (anon or service_role)',
		},
		{
			displayName: 'Additional Options',
			name: 'additionalOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			options: [
				{
					displayName: 'Schema',
					name: 'schema',
					type: 'string',
					default: 'public',
					description: 'Database schema to use (default: public)',
				},
				{
					displayName: 'Auto Refresh Token',
					name: 'autoRefreshToken',
					type: 'boolean',
					default: true,
					description: 'Whether to automatically refresh the access token',
				},
				{
					displayName: 'Persist Session',
					name: 'persistSession',
					type: 'boolean',
					default: false,
					description: 'Whether to persist the session to storage',
				},
				{
					displayName: 'Detect Session In URL',
					name: 'detectSessionInUrl',
					type: 'boolean',
					default: false,
					description: 'Whether to detect a session from the URL',
				},
			],
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				apikey: '={{$credentials.serviceKey}}',
				Authorization: 'Bearer {{$credentials.serviceKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.host}}/rest/v1/',
			url: '',
			method: 'GET',
			headers: {
				apikey: '={{$credentials.serviceKey}}',
				Authorization: 'Bearer {{$credentials.serviceKey}}',
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					message: 'Connected to Supabase successfully! Credentials are valid and the API is accessible.',
					key: 'status',
					value: 200,
				},
			},
		],
	};

	methods = {
		loadOptions: {
			// Load organizations for auto-discovery mode
			async getOrganizations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getOrganizationsOptions(this);
			},

			// Load projects for auto-discovery mode
			async getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getProjectsOptions(this);
			},

			// Legacy method for backward compatibility
			async getRecentProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = await this.getCredentials('supabaseApi');
					const connectionMode = credentials?.connectionMode as string;

					// If in auto mode, try to load real projects
					if (connectionMode === 'auto') {
						return getProjectsOptions(this);
					}

					// Manual mode - provide cached/example projects
					const commonProjects: INodePropertyOptions[] = [
						{
							name: 'Enter project URL manually',
							value: '',
							description: 'Type your Supabase project URL manually',
						},
					];

					// Extract project name from URL pattern
					const extractProjectName = (url: string): string => {
						try {
							const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
							return match && match[1] ? match[1] : url;
						} catch {
							return url;
						}
					};

					// Add some example projects (in real implementation, these would come from cache)
					const exampleProjects = [
						'https://your-project.supabase.co',
						'https://my-app.supabase.co',
						'https://demo-project.supabase.co',
					];

					for (const projectUrl of exampleProjects) {
						const projectName = extractProjectName(projectUrl);
						commonProjects.push({
							name: `${projectName} (${projectUrl})`,
							value: projectUrl,
							description: `Supabase project: ${projectName}`,
						});
					}

					return commonProjects;

				} catch (error) {
					return [
						{
							name: 'Enter project URL manually',
							value: '',
							description: 'Type your Supabase project URL (https://your-project.supabase.co)',
						},
					];
				}
			},
		},
	};
}
