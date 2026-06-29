import { useState } from 'react'
import { Box, Button, Center, Container, Flex, HStack, Heading, Textarea, VStack } from '@chakra-ui/react'
import { LuArrowRight, LuSparkle } from 'react-icons/lu'
import { parse } from './lib'

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
  const parseExpression = () => {
    try {
      const result = parse(expression)
      if (result.success) {
        console.log(`Result: ${result.result}`)
        return `Result: ${result.result}`
      } else {
        console.log(`Error: ${result.error}`)
        return `Error: ${result.error}`
      }
    } catch (error) {
      console.log(`Error: ${(error as Error).message}`)
      return `Error: ${(error as Error).message}`
    }
  }
  return (
    <Container maxW="4xl" height="full">
      <Center height="full">
        <VStack gap="10" paddingTop="10" width="full">
          <Heading size="4xl" fontWeight="normal" textAlign="center">
            Welcome to the Mathematical Equation Parser
          </Heading>
          <Box textAlign="center" color="colorPalette.fgMuted">
            <Box as="span" fontWeight="medium">
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
              />
              <HStack px="2" py="2" justify="flex-end">
                <Button size="xs" onClick={parseExpression}>
                  Parse expression
                  <LuArrowRight />
                </Button>
              </HStack>
            </Box>
          </Box>
          <Container maxW="2xl">
            <Flex align="flex-start" gap="4">
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
                  <Button px="3" key={prompt.text} size="xs" rounded="full" variant="outline" onClick={() => setExpression(prompt.text)}>
                    {prompt.text}
                  </Button>
                ))}
              </HStack>
            </Flex>
          </Container>
        </VStack>
      </Center>
    </Container>
  )
}