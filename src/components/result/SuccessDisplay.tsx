import {
  Box,
  HStack,
  Kbd,
  Separator,
  Stack,
} from '@chakra-ui/react'
import { LuSquareCheckBig } from 'react-icons/lu'
import type { ParseSuccess } from '../../lib'
import { AstViewer } from './AstViewer'

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
      <Stack gap="5">
        <Box>
          <Box textStyle="sm" fontWeight="medium" color="colorPalette.fgMuted" mb="1">
            Evaluation Result
          </Box>
          <Kbd size="lg" py="1" px="3" fontSize="lg">
            {JSON.stringify(result)}
          </Kbd>
        </Box>
        <Box>
          <Box textStyle="sm" fontWeight="medium" color="colorPalette.fgMuted" mb="2">
            Abstract Syntax Tree (AST)
          </Box>
          <AstViewer ast={ast} />
        </Box>
      </Stack>
    </Stack>
  )
}
