# multiAgents.py
# --------------
# Licensing Information: Please do not distribute or publish solutions to this
# project. You are free to use and extend these projects for educational
# purposes. The Pacman AI projects were developed at UC Berkeley, primarily by
# John DeNero (denero@cs.berkeley.edu) and Dan Klein (klein@cs.berkeley.edu).
# For more info, see http://inst.eecs.berkeley.edu/~cs188/sp09/pacman.html

from util import manhattanDistance
from game import Directions
import random, util, sys

from game import Agent

class ReflexAgent(Agent):
  """
    A reflex agent chooses an action at each choice point by examining
    its alternatives via a state evaluation function.
    The code below is provided as a guide.  You are welcome to change
    it in any way you see fit, so long as you don't touch our method
    headers.
  """


  def getAction(self, gameState):
    """
    You do not need to change this method, but you're welcome to.
    getAction chooses among the best options according to the evaluation function.
    Just like in the previous project, getAction takes a GameState and returns
    some Directions.X for some X in the set {North, South, West, East, Stop}
    """
    # Collect legal moves and successor states
    legalMoves = gameState.getLegalActions()

    # Choose one of the best actions
    scores = [self.evaluationFunction(gameState, action) for action in legalMoves]
    bestScore = max(scores)
    bestIndices = [index for index in range(len(scores)) if scores[index] == bestScore]
    chosenIndex = random.choice(bestIndices) # Pick randomly among the best

    "Add more of your code here if you want to"

    return legalMoves[chosenIndex]

  def evaluationFunction(self, currentGameState, action):
    """
    Design a better evaluation function here.
    The evaluation function takes in the current and proposed successor
    GameStates (pacman.py) and returns a number, where higher numbers are better.
    The code below extracts some useful information from the state, like the
    remaining food (newFood) and Pacman position after moving (newPos).
    newScaredTimes holds the number of moves that each ghost will remain
    scared because of Pacman having eaten a power pellet.
    Print out these variables to see what you're getting, then combine them
    to create a masterful evaluation function.
    """
    # Useful information you can extract from a GameState (pacman.py)
    successorGameState = currentGameState.generatePacmanSuccessor(action)
    newPos = successorGameState.getPacmanPosition()
    newFood = successorGameState.getFood()
    newGhostStates = successorGameState.getGhostStates()
    newScaredTimes = [ghostState.scaredTimer for ghostState in newGhostStates]

    "*** YOUR CODE HERE ***"
    if successorGameState.isWin():
        return float("inf") - 20
    ghostposition = currentGameState.getGhostPosition(1)
    distfromghost = util.manhattanDistance(ghostposition, newPos)
    score = max(distfromghost, 3) + successorGameState.getScore()
    foodlist = newFood.asList()
    closestfood = 100
    for foodpos in foodlist:
        thisdist = util.manhattanDistance(foodpos, newPos)
        if (thisdist < closestfood):
            closestfood = thisdist
    if (currentGameState.getNumFood() > successorGameState.getNumFood()):
        score += 100
    if action == Directions.STOP:
        score -= 3
    score -= 3 * closestfood
    capsuleplaces = currentGameState.getCapsules()
    if successorGameState.getPacmanPosition() in capsuleplaces:
        score += 120
    return score


def scoreEvaluationFunction(currentGameState):
  """
    This default evaluation function just returns the score of the state.
    The score is the same one displayed in the Pacman GUI.
    This evaluation function is meant for use with adversarial search agents
    (not reflex agents).
  """
  return currentGameState.getScore()

class MultiAgentSearchAgent(Agent):
  """
    This class provides some common elements to all of your
    multi-agent searchers.  Any methods defined here will be available
    to the MinimaxPacmanAgent, AlphaBetaPacmanAgent & ExpectimaxPacmanAgent.
    You *do not* need to make any changes here, but you can if you want to
    add functionality to all your adversarial search agents.  Please do not
    remove anything, however.
    Note: this is an abstract class: one that should not be instantiated.  It's
    only partially specified, and designed to be extended.  Agent (game.py)
    is another abstract class.
  """

  def __init__(self, evalFn = 'scoreEvaluationFunction', depth = '2'):
    self.index = 0 # Pacman is always agent index 0
    self.evaluationFunction = util.lookup(evalFn, globals())
    self.depth = int(depth)

class MinimaxAgent(MultiAgentSearchAgent):
  """
    Your minimax agent (question 2)
  """


  def getAction(self, gameState):
    """
      Returns the minimax action from the current gameState using self.depth
      and self.evaluationFunction.
      Here are some method calls that might be useful when implementing minimax.
      gameState.getLegalActions(agentIndex):
        Returns a list of legal actions for an agent
        agentIndex=0 means Pacman, ghosts are >= 1
      Directions.STOP:
        The stop direction, which is always legal
      gameState.generateSuccessor(agentIndex, action):
        Returns the successor game state after an agent takes an action
      gameState.getNumAgents():
        Returns the total number of agents in the game
    """
    "*** YOUR CODE HERE ***"
    def maxvalue(gameState, depth, numghosts):
        if gameState.isWin() or gameState.isLose() or depth == 0:
            return self.evaluationFunction(gameState)
        v = -(float("inf"))
        legalActions = gameState.getLegalActions(0)
        for action in legalActions:
            v = max(v, minvalue(gameState.generateSuccessor(0, action), depth - 1, 1, numghosts))
        return v
    
    def minvalue(gameState, depth, agentindex, numghosts):
        "numghosts = len(gameState.getGhostStates())"
        if gameState.isWin() or gameState.isLose() or depth == 0:
            return self.evaluationFunction(gameState)
        v = float("inf")
        legalActions = gameState.getLegalActions(agentindex)
        if agentindex == numghosts:
            for action in legalActions:
                v = min(v, maxvalue(gameState.generateSuccessor(agentindex, action), depth - 1, numghosts))
        else:
            for action in legalActions:
                v = min(v, minvalue(gameState.generateSuccessor(agentindex, action), depth, agentindex + 1, numghosts))
        return v
    legalActions = gameState.getLegalActions()
    numghosts = gameState.getNumAgents() - 1
    bestaction = Directions.STOP
    score = -(float("inf"))
    for action in legalActions:
        nextState = gameState.generateSuccessor(0, action)
        prevscore = score
        score = max(score, minvalue(nextState, self.depth, 1, numghosts))
        if score > prevscore:
            bestaction = action
    return bestaction
        
    util.raiseNotDefined()
    

class AlphaBetaAgent(MultiAgentSearchAgent):
  """
    Your minimax agent with alpha-beta pruning (question 3)
  """

  def getAction(self, gameState):
    """
      Returns the minimax action using self.depth and self.evaluationFunction
    """
    "*** YOUR CODE HERE ***"
    def maxvalue(gameState, alpha, beta, depth):
        if gameState.isWin() or gameState.isLose() or depth == 0:
            return self.evaluationFunction(gameState)
        v = -(float("inf"))
        legalActions = gameState.getLegalActions(0)
        for action in legalActions:
            nextState = gameState.generateSuccessor(0, action)
            v = max(v, minvalue(nextState, alpha, beta, gameState.getNumAgents() - 1, depth))
            if v >= beta:
                return v
            alpha = max(alpha, v)
        return v
    
    def minvalue(gameState, alpha, beta, agentindex, depth):
        numghosts = gameState.getNumAgents() - 1
        if gameState.isWin() or gameState.isLose() or depth == 0:
            return self.evaluationFunction(gameState)
        v = float("inf")
        legalActions = gameState.getLegalActions(agentindex)
        for action in legalActions:
            nextState = gameState.generateSuccessor(agentindex, action)
            if agentindex == numghosts:
                v = min(v, maxvalue(nextState, alpha, beta, depth - 1))
                if v <= alpha:
                    return v
                beta = min(beta, v)
            else:
                v = min(v, minvalue(nextState, alpha, beta, agentindex + 1, depth))
                if v <= alpha:
                    return v
                beta = min(beta, v)
        return v
    
    

    legalActions = gameState.getLegalActions(0)
    bestaction = Directions.STOP
    score = -(float("inf"))
    alpha = -(float("inf"))
    beta = float("inf")
    for action in legalActions:
        nextState = gameState.generateSuccessor(0, action)
        prevscore = score
        score = max(score, minvalue(nextState, alpha, beta, 1, self.depth))
        if score > prevscore:
            bestaction = action
        if score >= beta:
            return bestaction
        alpha = max(alpha, score)
    return bestaction

        
    util.raiseNotDefined()

class ExpectimaxAgent(MultiAgentSearchAgent):
  """
    Your expectimax agent (question 4)
  """

  def getAction(self, gameState):
    """
      Returns the expectimax action using self.depth and self.evaluationFunction
      All ghosts should be modeled as choosing uniformly at random from their
      legal moves.
    """
    "*** YOUR CODE HERE ***"
    def expectedvalue(gameState, agentindex, depth):
        if gameState.isWin() or gameState.isLose() or depth == 0:
            return self.evaluationFunction(gameState)
        numghosts = gameState.getNumAgents() - 1
        legalActions = gameState.getLegalActions(agentindex)
        numactions = len(legalActions)
        totalvalue = 0
        for action in legalActions:
            nextState = gameState.generateSuccessor(agentindex, action)
            if (agentindex == numghosts):
                totalvalue += maxvalue(nextState, depth - 1)
            else:
                totalvalue += expectedvalue(nextState, agentindex + 1, depth)
        return totalvalue / numactions
    def maxvalue(gameState, depth):
        if gameState.isWin() or gameState.isLose() or depth == 0:
            return self.evaluationFunction(gameState)
        legalActions = gameState.getLegalActions(0)
        bestAction = Directions.STOP
        score = -(float("inf"))
        for action in legalActions:
            prevscore = score
            nextState = gameState.generateSuccessor(0, action)
            score = max(score, expectedvalue(nextState, 1, depth))
        return score
    if gameState.isWin() or gameState.isLose():
        return self.evaluationFunction(gameState)
    legalActions = gameState.getLegalActions(0)
    bestaction = Directions.STOP
    score = -(float("inf"))
    for action in legalActions:
        nextState = gameState.generateSuccessor(0, action)
        prevscore = score
        score = max(score, expectedvalue(nextState, 1, self.depth))
        if score > prevscore:
            bestaction = action
    return bestaction
    
    util.raiseNotDefined()

def betterEvaluationFunction(currentGameState):
  """
    Your extreme ghost-hunting, pellet-nabbing, food-gobbling, unstoppable
    evaluation function (question 5).
    DESCRIPTION: <write something here so we know what you did>
    I want to incentivize winning so I return infinity if that is a win state.
    A large part of my strategy was "don't die." Dying gives you usually ~300 or less points, which will hurt your average. Winning usually gives
    you more points than losing.
    Here are the things I considered, along with some commentary on my decision making regarding them:1
    
    distance to the closest ghost: (disttoghost): I wanted pacman to run away from ghosts if they got too close. I did this
    by doing score += max(disttoghost, 4) * 2. If the ghost is more than distance 4 away, I didn't really care, and there is no difference between
    the ghost being 5 away and 500 away, because it's not close enough to threaten pacman. I added the max because my pacman would sometimes try to get
    farther away from a ghost already a long way away instead of going for food. That led to a lot of pacman idling in corners, wasting time and points. I added
    the * 2 so that the penalty for being near a ghost would be more severe and hopefully cause pacman to tend away from getting too close.
    
    closest food: I wanted to reward heading towards food, but not to the extent that it overrode the penalty of getting too close to a ghost. Thus, the score
    will be higher the closer pacman goes towards a food. By subtracting 1.5 * the distance, I got further distances to food to receive lower scores. This, however,
    introduced a problem where sometimes pacman would refuse to eat an isolated food because that would make the next turn's distance to food much higher. Thus, I had 
    to add the next thing.
    
    bonus for eating food: I subtracted 4 times the number of remaining foods, so that eating food would cause a more markedly higher score. You can only eat one food
    per move, so this made eating food preferable over not eating food.
    
    capsules: I thought that eating ghosts would increase my score, so I tried to slightly incentivize moving onto a capsule so that eating ghosts could increase my score.
    Thus, I subtracted 3.5 from scores for each existing capsule. This would only make a difference near the capsule.
    
    I then watched pacman's actions and adjusted the weights and numbers to visible strategic flaws.
    
    When I last submitted this, this averaged slightly over 1000. Let's hope it does so again.
    
    
  """
  "*** YOUR CODE HERE ***"
  if currentGameState.isWin():
      return float("inf")
  if currentGameState.isLose():
      return - float("inf")
  score = scoreEvaluationFunction(currentGameState)
  newFood = currentGameState.getFood()
  foodPos = newFood.asList()
  closestfood = float("inf")
  for pos in foodPos:
      thisdist = util.manhattanDistance(pos, currentGameState.getPacmanPosition())
      if (thisdist < closestfood):
          closestfood = thisdist
  numghosts = currentGameState.getNumAgents() - 1
  i = 1
  disttoghost = float("inf")
  while i <= numghosts:
      nextdist = util.manhattanDistance(currentGameState.getPacmanPosition(), currentGameState.getGhostPosition(i))
      disttoghost = min(disttoghost, nextdist)
      i += 1
  score += max(disttoghost, 4) * 2
  score -= closestfood * 1.5
  capsulelocations = currentGameState.getCapsules()
  score -= 4 * len(foodPos)
  score -= 3.5 * len(capsulelocations)
  return score

"""    
my other evaluation function from part a 
if successorGameState.isWin():
        return float("inf")
    ghostposition = currentGameState.getGhostPosition(1)
    distfromghost = util.manhattanDistance(ghostposition, newPos)
    score = max(distfromghost, 3) + successorGameState.getScore()
    foodlist = newFood.asList()
    closestfood = 100
    for foodpos in foodlist:
        thisdist = util.manhattanDistance(foodpos, newPos)
        if (thisdist < closestfood):
            closestfood = thisdist
    if (currentGameState.getNumFood() > successorGameState.getNumFood()):
        score += 5
    if action == Directions.STOP:
        score -= 3
    score -= 3 * closestfood
    return score
    """
# Abbreviation
better = betterEvaluationFunction

class ContestAgent(MultiAgentSearchAgent):
  """
    Your agent for the mini-contest
  """

  def getAction(self, gameState):
    """
      Returns an action.  You can use any method you want and search to any depth you want.
      Just remember that the mini-contest is timed, so you have to trade off speed and computation.
      Ghosts don't behave randomly anymore, but they aren't perfect either -- they'll usually
      just make a beeline straight towards Pacman (or away from him if they're scared!)
    """
    "*** YOUR CODE HERE ***"
    util.raiseNotDefined()