import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { contentFields, contentOperations } from './resources/content';
import { predictionFields, predictionOperations } from './resources/prediction';
import { profileFields, profileOperations } from './resources/profile';

export class Crystal implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Crystal',
		name: 'crystal',
		icon: { light: 'file:crystal.svg', dark: 'file:crystal.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Enrich profiles and get DISC personality insights from the Crystal Data API',
		defaults: {
			name: 'Crystal',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'crystalApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.crystalknows.com',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Profile',
						value: 'profile',
						description: 'Look up a profile Crystal already knows',
					},
					{
						name: 'Prediction',
						value: 'prediction',
						description: 'Search for and create a profile Crystal does not have yet',
					},
					{
						name: 'Content',
						value: 'content',
						description: 'Personality content, playbooks, prompts, and email revision',
					},
				],
				default: 'profile',
			},
			...profileOperations,
			...profileFields,
			...predictionOperations,
			...predictionFields,
			...contentOperations,
			...contentFields,
		],
	};
}
