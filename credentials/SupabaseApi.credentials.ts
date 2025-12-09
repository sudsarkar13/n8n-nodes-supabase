import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SupabaseApi implements ICredentialType {
	name = 'supabaseApi';

	displayName = 'Supabase API';

	documentationUrl = 'https://supabase.com/docs/reference/javascript/introduction';

	properties: INodeProperties[] = [
		{
			displayName: 'Project URL',
			name: 'host',
			type: 'string',
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
}
