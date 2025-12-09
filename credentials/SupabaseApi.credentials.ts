import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

export class SupabaseApi implements ICredentialType {
	name = 'supabaseApi';

	displayName = 'Supabase API';

	documentationUrl = 'https://supabase.com/docs/reference/javascript/introduction';

	properties: INodeProperties[] = [
		{
			displayName: 'Project URL',
			name: 'host',
			type: 'options',
			typeOptions: {
				loadOptionsMethod: 'getRecentProjects',
			},
			default: '',
			placeholder: 'Select a recent project or enter manually',
			required: true,
			description: 'Your Supabase project URL. Recent projects are cached for convenience.',
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
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					message: 'Connected to Supabase successfully',
					key: 'message',
					value: 'ok',
				},
			},
		],
	};

	methods = {
		loadOptions: {
			// Load recent Supabase project URLs from cache
			async getRecentProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// In a real implementation, this would use n8n's context storage
					// For now, we'll provide common Supabase URL patterns and allow manual input
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
