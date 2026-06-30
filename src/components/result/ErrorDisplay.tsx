import {
  Badge,
  Box,
  HStack,
  Kbd,
  Separator,
  Stack,
} from '@chakra-ui/react'
import { LuSquareX } from 'react-icons/lu'
import type { ErrorCategory, ParseError } from '../../lib'

// Error Category colour map

const categoryMeta: Record<ErrorCategory, { label: string; colorPalette: string }> = {
  lexer:     { label: 'Lexer Error',     colorPalette: 'orange' },
  parser:    { label: 'Parser Error',    colorPalette: 'red' },
  evaluator: { label: 'Evaluator Error', colorPalette: 'purple' },
}

// Input context with caret marker

const ErrorContext = ({ input, position: pos }: { input: string; position: { line: number; col: number } }) => {
  const lines = input.split('\n')
  const errorLine = lines[pos.line - 1] ?? ''
  const caretCol = Math.max(0, pos.col - 1)

  return (
    <Box
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.error"
      rounded="l2"
      p="3"
      fontFamily="monospace"
      fontSize="sm"
      overflow="auto"
      whiteSpace="pre"
    >
      <Box>{errorLine}</Box>
      <Box color="red.500" fontWeight="bold" userSelect="none">{' '.repeat(caretCol)}^</Box>
    </Box>
  )
}

export const ErrorDisplay = ({
  error,
  position,
  input,
  expected,
  suggestion,
  category,
}: ParseError) => {
  const cat = category && categoryMeta[category] ? categoryMeta[category] : categoryMeta.parser

  return (
    <Stack gap="4" width="full">
      <HStack gap="2">
        <LuSquareX />
        <Box fontWeight="semibold" textStyle="lg">
          Invalid Expression
        </Box>
        {category && (
          <Badge colorPalette={cat.colorPalette} size="sm">
            {cat.label}
          </Badge>
        )}
      </HStack>
      <Separator />
      <Stack gap="3">
        {/* Input context with caret pointer */}
        {input && position && (
          <Box>
            <Box textStyle="sm" fontWeight="medium" color="colorPalette.fgMuted" mb="1">
              Input
            </Box>
            <ErrorContext input={input} position={position} />
          </Box>
        )}

        {/* Error message */}
        <Box>
          <Box textStyle="sm" fontWeight="medium" color="colorPalette.fgMuted" mb="1">
            Error
          </Box>
          <Box
            bg="bg.subtle"
            borderWidth="1px"
            borderColor="border.error"
            rounded="l2"
            p="3"
            fontSize="sm"
            fontFamily="monospace"
          >
            {error}
          </Box>
        </Box>

        {/* Expected tokens */}
        {expected && expected.length > 0 && (
          <Box>
            <Box textStyle="sm" fontWeight="medium" color="colorPalette.fgMuted" mb="1">
              Expected
            </Box>
            <HStack gap="2" flexWrap="wrap">
              {expected.map((exp) => (
                <Kbd key={exp} size="sm">{exp}</Kbd>
              ))}
            </HStack>
          </Box>
        )}

        {/* Suggestion */}
        {suggestion && (
          <Box>
            <Box textStyle="sm" fontWeight="medium" color="colorPalette.fgMuted" mb="1">
              Suggestion
            </Box>
            <Box
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.info"
              rounded="l2"
              p="3"
              fontSize="sm"
            >
              {suggestion}
            </Box>
          </Box>
        )}

        {/* Position (fallback) */}
        {position && !input && (
          <Box>
            <Box textStyle="sm" fontWeight="medium" color="colorPalette.fgMuted" mb="1">
              Position
            </Box>
            <HStack gap="4">
              <Box>Line <Kbd>{position.line}</Kbd></Box>
              <Box>Column <Kbd>{position.col}</Kbd></Box>
            </HStack>
          </Box>
        )}
      </Stack>
    </Stack>
  )
}
