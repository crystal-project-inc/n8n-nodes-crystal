import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const showForContent = { resource: ['content'] };

const showFor = (operation: string) => ({ resource: ['content'], operation: [operation] });

/** Split a comma / newline separated list of profile IDs into a clean array. */
function parseProfileIds(context: IExecuteSingleFunctions): string[] {
	const raw = context.getNodeParameter('profileIds', '') as string;
	const ids = raw
		.split(/[\s,]+/)
		.map((id) => id.trim())
		.filter((id) => id !== '');

	if (ids.length === 0) {
		throw new NodeOperationError(context.getNode(), 'Provide at least one profile ID.', {
			itemIndex: context.getItemIndex(),
		});
	}

	return ids;
}

async function attachProfileIdsBody(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	requestOptions.body = { profile_ids: parseProfileIds(this) };
	return requestOptions;
}

/** Build the body for generate_prompt / revise_email: exactly one of id or disc_type, plus extras. */
function attachRecipientBody(extra: (context: IExecuteSingleFunctions) => IDataObject) {
	return async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const identifyBy = this.getNodeParameter('identifyBy') as string;

		const recipient: IDataObject =
			identifyBy === 'discType'
				? { disc_type: (this.getNodeParameter('discType', '') as string).trim() }
				: { id: (this.getNodeParameter('profileId', '') as string).trim() };

		const recipientValue = Object.values(recipient)[0] as string;
		if (!recipientValue) {
			throw new NodeOperationError(
				this.getNode(),
				identifyBy === 'discType' ? 'Provide a DISC type.' : 'Provide a profile ID.',
				{ itemIndex: this.getItemIndex() },
			);
		}

		requestOptions.body = { ...recipient, ...extra(this) };
		return requestOptions;
	};
}

export const contentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForContent },
		options: [
			{
				name: 'Get Personality Content',
				value: 'getProfileContent',
				action: 'Get full personality content for a profile',
				description: 'Full personality content for a profile you already have an ID for. Free.',
				routing: {
					request: {
						method: 'GET',
						url: '=/v4/content/profile/{{ encodeURIComponent($parameter.profileId) }}',
					},
				},
			},
			{
				name: 'Get Selling-To Playbook',
				value: 'getSellingTo',
				action: 'Get a selling to this person playbook',
				description: 'A "selling to this person" playbook for a profile. Free.',
				routing: {
					request: {
						method: 'GET',
						url: '=/v4/content/profile/{{ encodeURIComponent($parameter.profileId) }}/selling_to',
					},
				},
			},
			{
				name: 'Get Communication Advice',
				value: 'communicationAdvice',
				action: 'Get communication advice for one or more profiles',
				description: 'Communication advice for each of the given profiles. Free.',
				routing: {
					request: { method: 'POST', url: '/v4/content/profiles/communication_advice' },
					send: { preSend: [attachProfileIdsBody] },
				},
			},
			{
				name: 'Get Relationship Matrix',
				value: 'relationshipMatrix',
				action: 'Get a relationship matrix across profiles',
				description: 'A relationship matrix across the given profiles. Free.',
				routing: {
					request: { method: 'POST', url: '/v4/content/profiles/relationship_matrix' },
					send: { preSend: [attachProfileIdsBody] },
				},
			},
			{
				name: 'Generate Prompt',
				value: 'generatePrompt',
				action: 'Generate a DISC tuned prompt for communicating with a person',
				description:
					'A ready-to-inject, DISC-tuned prompt you paste into your own AI workflow. Deterministic and free — use this if you bring your own LLM.',
				routing: {
					request: { method: 'POST', url: '/v4/content/generate_prompt' },
					send: {
						preSend: [
							attachRecipientBody((context) => {
								const objective = (context.getNodeParameter('objective', '') as string).trim();
								return objective ? { objective } : {};
							}),
						],
					},
				},
			},
			{
				name: 'Revise Email',
				value: 'reviseEmail',
				action: 'Revise a draft email for the recipients DISC type',
				description:
					'Rewrite a draft email so it lands well with the recipient, adapting tone, structure, and directness to their DISC type. Runs a real model call — costs 1 API credit per successful revision.',
				routing: {
					request: { method: 'POST', url: '/v4/content/revise_email' },
					send: {
						preSend: [
							attachRecipientBody((context) => ({
								email: context.getNodeParameter('emailDraft', '') as string,
							})),
						],
					},
				},
			},
		],
		default: 'getProfileContent',
	},
];

export const contentFields: INodeProperties[] = [
	{
		displayName: 'Profile ID',
		name: 'profileId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['content'], operation: ['getProfileContent', 'getSellingTo'] },
		},
		description: 'A Crystal profile ID, e.g. from a Profile or Prediction step',
	},
	{
		displayName: 'Profile IDs',
		name: 'profileIds',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'id1, id2, id3',
		displayOptions: {
			show: { resource: ['content'], operation: ['communicationAdvice', 'relationshipMatrix'] },
		},
		description: 'Crystal profile IDs, separated by commas or new lines',
	},
	{
		displayName: 'Identify Recipient By',
		name: 'identifyBy',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['content'], operation: ['generatePrompt', 'reviseEmail'] },
		},
		options: [
			{ name: 'Profile ID', value: 'id' },
			{ name: 'DISC Type', value: 'discType' },
		],
		default: 'id',
		description: 'Use a Crystal profile ID when one exists, otherwise a raw DISC type',
	},
	{
		displayName: 'Profile ID',
		name: 'profileId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['generatePrompt', 'reviseEmail'],
				identifyBy: ['id'],
			},
		},
	},
	{
		displayName: 'DISC Type',
		name: 'discType',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'D, Di, Sc …',
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['generatePrompt', 'reviseEmail'],
				identifyBy: ['discType'],
			},
		},
	},
	{
		displayName: 'Objective',
		name: 'objective',
		type: 'string',
		default: '',
		placeholder: 'write a follow-up email after a demo',
		displayOptions: { show: showFor('generatePrompt') },
		description: 'Optional — a task to focus the prompt on',
	},
	{
		displayName: 'Email Draft',
		name: 'emailDraft',
		type: 'string',
		required: true,
		typeOptions: { rows: 6 },
		default: '',
		displayOptions: { show: showFor('reviseEmail') },
		description: 'The draft email to revise',
	},
];
