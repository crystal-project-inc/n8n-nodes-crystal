import type { IExecuteSingleFunctions, IHttpRequestOptions, INodeProperties } from 'n8n-workflow';
import { buildProfileQuery, personQueryFields } from '../../shared/personQuery';

const showForProfile = { resource: ['profile'] };
const showForProfileGet = { resource: ['profile'], operation: ['get'] };

export const profileOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForProfile },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a profile',
				description:
					'Real-time lookup of a profile Crystal already knows. Does not create new profiles — returns nothing found if the person is not already known. Spends 1 credit on a hit (re-fetches of the same profile are free).',
				routing: {
					request: {
						method: 'GET',
						url: '/v4/profile',
					},
					send: {
						preSend: [
							async function (
								this: IExecuteSingleFunctions,
								requestOptions: IHttpRequestOptions,
							): Promise<IHttpRequestOptions> {
								requestOptions.qs = {
									...requestOptions.qs,
									...buildProfileQuery(this),
								};
								return requestOptions;
							},
						],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: { property: 'data' },
							},
						],
					},
				},
			},
		],
		default: 'get',
	},
];

export const profileFields: INodeProperties[] = [
	...personQueryFields({ show: showForProfileGet }),
];
