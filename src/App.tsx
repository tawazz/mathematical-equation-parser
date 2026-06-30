import { useState } from 'react'
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  HStack,
  Heading,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { LuArrowRight, LuSparkle } from 'react-icons/lu'
import { CiRedo } from "react-icons/ci";
import { parse, type ParseResult } from './lib'
import { ResultDisplay } from './components/result/ResultDisplay'

// block.tsx
const prompts = [
  { text: '1 + 2 = 3' },
  { text: '2 * 3 + 4 = 10' },
  { text: '2 * (3 + 4) = 10' },
  { text: '6 = 10 / 2 + 1' },
  { text: '12 + 3 != 4 / 2 + 5' },
  { text: '2 + 3 * 2 = 10' },
  { text: '2 * 3 + 4 != 10' },
  { text: '1 + (2 = 3' },
]



export const App = () => {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState<ParseResult | null>(null)

  const parseExpression = () => {
    const parsed = parse(expression)
    setResult(parsed)
  }

  const handlePromptClick = (text: string) => {
    setExpression(text)
    setResult(null)
  }

  const handleReset = () => {
    setExpression('')
    setResult(null)
  }

  return (
    <Container maxW="4xl" height="full">
      <Center height="full">
        <VStack gap="10" paddingTop="10" width="full">
          <Heading size="4xl" fontWeight="normal" textAlign="center">
            Welcome to the Mathematical Equation Parser
          </Heading>
          <Box textAlign="center" color="colorPalette.fgMuted">
            <Box fontWeight="medium">
              Parse mathematical expressions with ease.
            </Box>{' '}
            Enter your expression below and click "Parse expression" to see the result.
          </Box>
          <Box w="full">
            <Box borderWidth="1px" rounded="l2" _focusWithin={{ borderColor: 'border.emphasized' }}>
              <Textarea
                px="4"
                py="4"
                unstyled
                bg="transparent"
                outline="none"
                width="full"
                resize="none"
                placeholder="Enter your expression here eg 1 + 2 = 3..."
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                disabled={result !== null && result.success}
              />
              <HStack px="2" py="2" justify="flex-end">
                {result === null || !result.success ? (
                  <Button size="xs" onClick={parseExpression} disabled={result !== null && result.success}>
                    Parse expression
                    <LuArrowRight />
                  </Button>
                ) : (
                  <Button size="xs" variant="outline" onClick={handleReset}>
                    <CiRedo />
                    Try another expression
                  </Button>
                )}
              </HStack>
            </Box>
          </Box>
          {result ? (
            <Container maxW="2xl">
              <Box
                borderWidth="1px"
                rounded="l2"
                p="6"
                width="full"
              >
                <ResultDisplay result={result} />
              </Box>
            </Container>
          ) : (
            <Container maxW="2xl">
              <Flex align="center" gap="10" direction="column">
                <HStack
                  hideBelow="md"
                  flexShrink="0"
                  color="colorPalette.fg"
                  textStyle="sm"
                  pos="relative"
                  top="2"
                  fontWeight="medium"
                >
                  <LuSparkle />
                  Try these
                </HStack>
                <HStack wrap="wrap" colorPalette="gray" justify="center">
                  {prompts.map((prompt) => (
                    <Button px="3" key={prompt.text} size="xs" rounded="full" variant="outline" onClick={() => handlePromptClick(prompt.text)}>
                      {prompt.text}
                    </Button>
                  ))}
                </HStack>
              </Flex>
            </Container>
          )}
        </VStack>
      </Center>
    </Container>
  )
}