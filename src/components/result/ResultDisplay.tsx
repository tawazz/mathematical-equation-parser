import type { ParseResult } from '../../lib'
import { SuccessDisplay } from './SuccessDisplay'
import { ErrorDisplay } from './ErrorDisplay'

export const ResultDisplay = ({ result }: { result: ParseResult }) => {
  if (result.success) {
    return <SuccessDisplay {...result} />
  }

  return <ErrorDisplay {...result} />
}
