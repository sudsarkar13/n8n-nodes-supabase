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

	documentationUrl = 'https://supabase.com/docs/guides/api';

	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: '',
			placeholder: 'https://your-project.supabase.co',
			required: true,
			description: 'Your Supabase project URL',
		},
		{
			displayName: 'Service Role Secret',
			name: 'serviceKey',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			required: true,
			description: 'Your Supabase API key (service_role key recommended for full access)',
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
					displayName: 'Enable Management API Features',
					name: 'enableManagementApi',
					type: 'boolean',
					default: false,
					description: 'Enable advanced features like auto-discovery of tables and buckets',
				},
				{
					displayName: 'Management API Token',
					name: 'managementToken',
					type: 'string',
					typeOptions: {
						password: true,
					},
					displayOptions: {
						show: {
							enableManagementApi: [true],
						},
					},
					default: '',
					placeholder: 'sbp_xxxxxxxxxxxxxxxxxxxx',
					description: 'Your Supabase Management API token for enhanced features (optional)',
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
			baseURL: '={{$credentials.host}}',
			url: '/rest/v1/',
			method: 'GET',
			headers: {
				apikey: '={{$credentials.serviceKey}}',
				Authorization: 'Bearer {{$credentials.serviceKey}}',
				'Accept': 'application/vnd.pgrst.object+json',
				'Content-Type': 'application/json',
			},
		},
	};

}
