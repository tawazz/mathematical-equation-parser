import { Box, HStack, Stack } from '@chakra-ui/react'
import type { ASTNode } from '../../lib'
import { getOperator } from '../../lib/operators'

// ── Node colour & label map ───────────────────────────────────────────────────

const nodeMeta: Record<ASTNode['type'], { label: string; accent: string }> = {
  number:     { label: 'Number',     accent: 'teal' },
  binary:     { label: 'Binary',     accent: 'blue' },
  comparison: { label: 'Comparison', accent: 'purple' },
}

// ── Recursive AST node renderer ───────────────────────────────────────────────

interface AstNodeViewProps {
  node: ASTNode
}

const AstNodeView = ({ node }: AstNodeViewProps) => {
  const meta = nodeMeta[node.type]

  // ── Leaf: NumberNode ──────────────────────────────────────────────────────
  if (node.type === 'number') {
    return (
      <HStack
        borderWidth="1px"
        borderColor={`${meta.accent}.200`}
        bg={`${meta.accent}.50`}
        rounded="l2"
        px="3"
        py="2"
        gap="2"
        width="fit-content"
      >
        <Box
          as="span"
          bg={`${meta.accent}.500`}
          color="white"
          fontSize="xs"
          fontWeight="bold"
          px="1.5"
          py="0.5"
          rounded="l1"
          lineHeight="1"
        >
          {meta.label}
        </Box>
        <Box fontFamily="mono" fontSize="md" fontWeight="semibold">
          {node.value}
        </Box>
      </HStack>
    )
  }

  // ── Internal node: BinaryNode | ComparisonNode ────────────────────────────
  const opDef = getOperator(node.operator)
  const opSymbol = opDef?.display ?? node.operator

  return (
    <Stack gap="0">
      {/* Operator header */}
      <HStack
        borderWidth="1px"
        borderColor={`${meta.accent}.200`}
        bg={`${meta.accent}.50`}
        rounded="l2"
        px="3"
        py="2"
        gap="2"
        width="fit-content"
      >
        <Box
          as="span"
          bg={`${meta.accent}.500`}
          color="white"
          fontSize="xs"
          fontWeight="bold"
          px="1.5"
          py="0.5"
          rounded="l1"
          lineHeight="1"
        >
          {meta.label}
        </Box>
        <Box
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          bg={`${meta.accent}.100`}
          color={`${meta.accent}.700`}
          fontSize="lg"
          fontWeight="bold"
          w="7"
          h="7"
          rounded="l1"
          fontFamily="mono"
        >
          {opSymbol}
        </Box>
      </HStack>

      {/* Children */}
      <Stack gap="3" mt="2" ml="3" pl="4" borderLeft="2px" borderColor={`${meta.accent}.200`}>
        <Box>
          <Box fontSize="xs" fontWeight="medium" color="colorPalette.fgMuted" mb="1">
            Left
          </Box>
          <AstNodeView node={node.left} />
        </Box>
        <Box>
          <Box fontSize="xs" fontWeight="medium" color="colorPalette.fgMuted" mb="1">
            Right
          </Box>
          <AstNodeView node={node.right} />
        </Box>
      </Stack>
    </Stack>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

interface AstViewerProps {
  ast: ASTNode
}

export const AstViewer = ({ ast }: AstViewerProps) => {
  return (
    <Box
      bg="bg.subtle"
      borderWidth="1px"
      rounded="l2"
      p="5"
      fontSize="sm"
      fontFamily="mono"
      overflow="auto"
      maxH="md"
    >
      <AstNodeView node={ast} />
    </Box>
  )
}
