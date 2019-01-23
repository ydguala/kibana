/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { isEmpty, isNumber } from 'lodash/fp';
import { StaticIndexPattern } from 'ui/index_patterns';

import { convertKueryToElasticSearchQuery, escapeQueryValue } from '../../lib/keury';
import { DataProvider } from './data_providers/data_provider';

const buildQueryMatch = (dataProvider: DataProvider) =>
  `${dataProvider.excluded ? 'NOT ' : ''}${
    dataProvider.queryMatch
      ? `${dataProvider.queryMatch.field} : ${
          isNumber(dataProvider.queryMatch.value)
            ? dataProvider.queryMatch.value
            : escapeQueryValue(dataProvider.queryMatch.value)
        }`
      : ''
  }`.trim();

const buildQueryDate = (dataProvider: DataProvider) =>
  dataProvider.queryDate
    ? `@timestamp >= ${dataProvider.queryDate.from} and @timestamp <= ${dataProvider.queryDate.to}`
    : '';

const buildQueryForAndProvider = (dataAndProviders: DataProvider[]) =>
  dataAndProviders
    .reduce((andQuery, andDataProvider) => {
      const prepend = (q: string) => `${q !== '' ? `${q} and ` : ''}`;
      return andDataProvider.enabled
        ? `${prepend(andQuery)} ${buildQueryMatch(andDataProvider)}`
        : andQuery;
    }, '')
    .trim();

export const buildGlobalQuery = (dataProviders: DataProvider[]) =>
  dataProviders
    .reduce((query, dataProvider) => {
      const prepend = (q: string) => `${q !== '' ? `${q} or ` : ''}`;
      return dataProvider.enabled
        ? `${prepend(query)}(
        ${buildQueryMatch(dataProvider)}
        ${dataProvider.queryDate ? ` and ${buildQueryDate(dataProvider)}` : ''}
        ${
          dataProvider.and.length > 0 ? ` and ${buildQueryForAndProvider(dataProvider.and)}` : ''
        })`.trim()
        : query;
    }, '')
    .trim();

export const combineQueries = (
  dataProviders: DataProvider[],
  indexPattern: StaticIndexPattern
): { filterQuery: string } | null => {
  if (isEmpty(dataProviders)) {
    return null;
  }

  const globalQuery = buildGlobalQuery(dataProviders);
  if (isEmpty(globalQuery)) {
    return null;
  }

  return {
    filterQuery: convertKueryToElasticSearchQuery(globalQuery, indexPattern),
  };
};

interface CalculateBodyHeightParams {
  /** The the height of the flyout container, which is typically the entire "page", not including the standard Kibana navigation */
  flyoutHeight?: number;
  /** The flyout header typically contains a title and a close button */
  flyoutHeaderHeight?: number;
  /** All non-body timeline content (i.e. the providers drag and drop area, and the column headers)  */
  timelineHeaderHeight?: number;
  /** Footer content that appears below the body (i.e. paging controls) */
  timelineFooterHeight?: number;
}

export const calculateBodyHeight = ({
  flyoutHeight = 0,
  flyoutHeaderHeight = 0,
  timelineHeaderHeight = 0,
  timelineFooterHeight = 0,
}: CalculateBodyHeightParams): number =>
  flyoutHeight - (flyoutHeaderHeight + timelineHeaderHeight + timelineFooterHeight);
