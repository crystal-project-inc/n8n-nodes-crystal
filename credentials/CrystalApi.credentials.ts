import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CrystalApi implements ICredentialType {
	name = 'crystalApi';

	displayName = 'Crystal API';

	icon: Icon = { light: 'file:crystal.svg', dark: 'file:crystal.dark.svg' };

	documentationUrl =
		'https://github.com/crystal-project-inc/n8n-nodes-crystal?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Generate a key at data.crystalknows.com/api-keys (requires a verified email). Treat it like a password — anyone with it can call the API as you.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// generate_prompt is free, deterministic, and returns 200 for a bare DISC
	// type — a valid key succeeds, an invalid one returns 401.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.crystalknows.com',
			url: '/v4/content/generate_prompt',
			method: 'POST',
			body: { disc_type: 'D' },
		},
	};
}
