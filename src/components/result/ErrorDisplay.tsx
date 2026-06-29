import {
  Box,
  HStack,
  Kbd,
  Separator,
  Stack,
} from '@chakra-ui/react'
import { LuSquareX } from 'react-icons/lu'
import type { ParseError } from '../../lib'

export const ErrorDisplay = ({ error, position }: ParseError) => {
  return (
    <Stack gap="4" width="full">
      <HStack gap="2">
        <LuSquareX />
        <Box fontWeight="semibold" textStyle="lg">
          Invalid Expression
        </Box>
      </HStack>
      <Separator />
      <Stack gap="3">
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
        {position && (
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
