import {
  Box,
  Code,
  HStack,
  Kbd,
  Separator,
  Stack,
} from '@chakra-ui/react'
import { LuSquareCheckBig } from 'react-icons/lu'
import type { ParseSuccess } from '../../lib'

export const SuccessDisplay = ({ ast, result }: ParseSuccess) => {
  return (
    <Stack gap="4" width="full">
      <HStack gap="2">
        <LuSquareCheckBig />
        <Box fontWeight="semibold" textStyle="lg">
          Valid Expression
        </Box>
      </HStack>
      <Separator />
      <Stack gap="3">
        <Box>
          <Box textStyle="sm" fontWeight="medium" color="colorPalette.fgMuted" mb="1">
            Evaluation Result
          </Box>
          <Kbd size="lg" py="1" px="3" fontSize="lg">
            {JSON.stringify(result)}
          </Kbd>
        </Box>
        <Box>
          <Box textStyle="sm" fontWeight="medium" color="colorPalette.fgMuted" mb="1">
            Abstract Syntax Tree (AST)
          </Box>
          <Box
            as="pre"
            bg="bg.subtle"
            borderWidth="1px"
            rounded="l2"
            p="4"
            fontSize="xs"
            fontFamily="monospace"
            overflow="auto"
            maxH="xs"
          >
            <Code variant="subtle" fontSize="xs">
              {JSON.stringify(ast, null, 2)}
            </Code>
          </Box>
        </Box>
      </Stack>
    </Stack>
  )
}
