import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError, sleep } from 'n8n-workflow';

const BASE_URL = 'https://api.crystalknows.com';
const TERMINAL_STATUSES = ['completed', 'failed'];

/**
 * `postReceive` handler for `Prediction: Create and Wait`.
 *
 * The initial response is the `202 { job_id, status: "queued" }` from
 * `POST /v4/predictions`. Crystal calls out to external data providers in the
 * background, so we poll `GET /v4/predictions/:job_id` on a short interval until
 * the job reaches a terminal state (`completed` / `failed`) or the timeout is
 * hit, then emit the final job object.
 *
 * A polling loop with a bounded wait is not expressible with declarative
 * routing alone, which is why this operation uses a custom handler.
 */
export async function pollPrediction(
	this: IExecuteSingleFunctions,
	_items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const itemIndex = this.getItemIndex();
	const submission = (response.body ?? {}) as IDataObject;
	const jobId = submission.job_id as string | undefined;

	if (!jobId) {
		throw new NodeApiError(this.getNode(), submission as JsonObject, {
			message: 'Crystal did not return a job_id for the submitted prediction.',
			itemIndex,
		});
	}

	const pollIntervalMs =
		Math.max(1, this.getNodeParameter('pollInterval', 3) as number) * 1000;
	const timeoutMs = Math.max(1, this.getNodeParameter('timeout', 120) as number) * 1000;
	const deadline = Date.now() + timeoutMs;

	let job: IDataObject = { ...submission };

	while (!TERMINAL_STATUSES.includes(job.status as string)) {
		if (Date.now() >= deadline) {
			throw new NodeOperationError(
				this.getNode(),
				`Prediction ${jobId} did not finish within ${timeoutMs / 1000}s. Use "Prediction: Get" to retrieve it later.`,
				{ itemIndex },
			);
		}

		await sleep(pollIntervalMs);

		const requestOptions: IHttpRequestOptions = {
			baseURL: BASE_URL,
			url: `/v4/predictions/${encodeURIComponent(jobId)}`,
			method: 'GET',
			json: true,
		};

		job = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'crystalApi',
			requestOptions,
		)) as IDataObject;
	}

	return [{ json: job, pairedItem: { item: itemIndex } }];
}
