import type { IDataObject, IDisplayOptions, IExecuteSingleFunctions, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/**
 * The six identifiers Crystal accepts to resolve a single person. Used by both
 * `Profile: Get` (as query-string params) and `Prediction: Create` (nested
 * under `query` in the request body).
 */
export const PERSON_QUERY_PARAMETERS = [
	'fullName',
	'email',
	'linkedinUrl',
	'jobTitle',
	'companyName',
	'phone',
] as const;

type ParameterMap = Record<(typeof PERSON_QUERY_PARAMETERS)[number], string>;

/** n8n parameter name -> Crystal wire name for the `GET /v4/profile` query string. */
const PROFILE_WIRE_NAMES: ParameterMap = {
	fullName: 'full_name',
	email: 'email',
	linkedinUrl: 'linkedin_url',
	jobTitle: 'job_title',
	companyName: 'company_name',
	phone: 'phone',
};

/** n8n parameter name -> Crystal wire name for the `POST /v4/predictions` body's `query` object. */
const PREDICTION_WIRE_NAMES: ParameterMap = {
	fullName: 'name',
	email: 'email',
	linkedinUrl: 'linkedin_url',
	jobTitle: 'job_title',
	companyName: 'company_name',
	phone: 'phone',
};

export function personQueryFields(displayOptions: IDisplayOptions): INodeProperties[] {
	return [
		{
			displayName: 'Full Name',
			name: 'fullName',
			type: 'string',
			default: '',
			displayOptions,
			description:
				'For predictions this is combined with job title and company name; for a profile lookup it is matched on its own',
		},
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			placeholder: 'name@email.com',
			default: '',
			displayOptions,
		},
		{
			displayName: 'LinkedIn URL',
			name: 'linkedinUrl',
			type: 'string',
			default: '',
			displayOptions,
		},
		{
			displayName: 'Job Title',
			name: 'jobTitle',
			type: 'string',
			default: '',
			displayOptions,
		},
		{
			displayName: 'Company Name',
			name: 'companyName',
			type: 'string',
			default: '',
			displayOptions,
		},
		{
			displayName: 'Phone',
			name: 'phone',
			type: 'string',
			default: '',
			displayOptions,
		},
	];
}

function collectPersonQuery(
	context: IExecuteSingleFunctions,
	wireNames: ParameterMap,
): IDataObject {
	const query: IDataObject = {};

	for (const parameter of PERSON_QUERY_PARAMETERS) {
		const value = context.getNodeParameter(parameter, '') as string;
		if (typeof value === 'string' && value.trim() !== '') {
			query[wireNames[parameter]] = value.trim();
		}
	}

	if (Object.keys(query).length === 0) {
		throw new NodeOperationError(
			context.getNode(),
			'Provide at least one identifier (full name, email, LinkedIn URL, job title, company name, or phone).',
			{ itemIndex: context.getItemIndex() },
		);
	}

	return query;
}

/** Build the `GET /v4/profile` query string from the shared person fields. */
export function buildProfileQuery(context: IExecuteSingleFunctions): IDataObject {
	return collectPersonQuery(context, PROFILE_WIRE_NAMES);
}

/** Build the `POST /v4/predictions` `query` object from the shared person fields. */
export function buildPredictionQuery(context: IExecuteSingleFunctions): IDataObject {
	return collectPersonQuery(context, PREDICTION_WIRE_NAMES);
}
