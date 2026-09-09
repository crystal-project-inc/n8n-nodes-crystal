import type { IExecuteSingleFunctions, IHttpRequestOptions, INodeProperties } from 'n8n-workflow';
import { buildPredictionQuery, personQueryFields } from '../../shared/personQuery';
import { pollPrediction } from '../../shared/pollPrediction';

const showForPrediction = { resource: ['prediction'] };
const showForCreate = { resource: ['prediction'], operation: ['create', 'createAndWait'] };
const showForCreateAndWait = { resource: ['prediction'], operation: ['createAndWait'] };
const showForGet = { resource: ['prediction'], operation: ['get'] };

async function attachPredictionBody(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const recordId = (this.getNodeParameter('recordId', '') as string).trim();

	requestOptions.body = {
		query: buildPredictionQuery(this),
		...(recordId ? { record_id: recordId } : {}),
	};

	return requestOptions;
}

export const predictionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForPrediction },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Submit a prediction job',
				description:
					'Submit an async lookup and return immediately with a job ID. Poll it later with "Get". A credit is spent only if the job completes with a profile found.',
				routing: {
					request: { method: 'POST', url: '/v4/predictions' },
					send: { preSend: [attachPredictionBody] },
				},
			},
			{
				name: 'Create and Wait',
				value: 'createAndWait',
				action: 'Submit a prediction job and wait for the result',
				description:
					'Submit an async lookup, then poll until the job finishes (or the timeout is hit) and return the final result. A credit is spent only if a profile is found.',
				routing: {
					request: { method: 'POST', url: '/v4/predictions' },
					send: { preSend: [attachPredictionBody] },
					output: { postReceive: [pollPrediction] },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a prediction job result',
				description: 'Poll for the result of a previously submitted prediction job',
				routing: {
					request: {
						method: 'GET',
						url: '=/v4/predictions/{{ encodeURIComponent($parameter.jobId) }}',
					},
				},
			},
		],
		default: 'createAndWait',
	},
];

export const predictionFields: INodeProperties[] = [
	...personQueryFields({ show: showForCreate }),
	{
		displayName: 'Record ID',
		name: 'recordId',
		type: 'string',
		default: '',
		displayOptions: { show: showForCreate },
		description:
			'Client-supplied idempotency key. Resubmitting the same record ID will not double-charge.',
	},
	{
		displayName: 'Poll Interval (Seconds)',
		name: 'pollInterval',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 3,
		displayOptions: { show: showForCreateAndWait },
		description: 'How long to wait between poll attempts. Jobs typically finish within tens of seconds.',
	},
	{
		displayName: 'Timeout (Seconds)',
		name: 'timeout',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 120,
		displayOptions: { show: showForCreateAndWait },
		description:
			'Give up waiting after this many seconds. The job keeps running on Crystal’s side — retrieve it later with "Get".',
	},
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: showForGet },
		description: 'The job ID returned by "Create"',
	},
];
