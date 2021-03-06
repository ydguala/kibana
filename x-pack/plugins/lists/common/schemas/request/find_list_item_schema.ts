/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import * as t from 'io-ts';

import { cursor, filter, list_id, sort_field, sort_order } from '../common/schemas';
import { RequiredKeepUndefined } from '../../types';
import { StringToPositiveNumber } from '../types/string_to_positive_number';

export const findListItemSchema = t.intersection([
  t.exact(t.type({ list_id })),
  t.exact(
    t.partial({
      cursor, // defaults to undefined if not set during decode
      filter, // defaults to undefined if not set during decode
      page: StringToPositiveNumber, // defaults to undefined if not set during decode
      per_page: StringToPositiveNumber, // defaults to undefined if not set during decode
      sort_field, // defaults to undefined if not set during decode
      sort_order, // defaults to undefined if not set during decode
    })
  ),
]);

export type FindListItemSchema = t.OutputOf<typeof findListItemSchema>;

// This type is used after a decode since some things are defaults after a decode.
export type FindListItemSchemaDecoded = RequiredKeepUndefined<t.TypeOf<typeof findListItemSchema>>;
