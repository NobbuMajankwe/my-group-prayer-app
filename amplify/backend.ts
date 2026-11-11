import { defineBackend } from '@aws-amplify/backend';
import { data }          from './data/resource';

/**
 * PrayTogether backend
 * Defines AppSync + DynamoDB resources deployed via Amplify Gen 2.
 */
export const backend = defineBackend({ data });
