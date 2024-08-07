from itertools import combinations
import time
# This script iterates over all 81choose12 combinations of SET cards and checks whether the combination
# has exactly N Sets (three cards, where each card has four characteristics, each may have one of three
# values, and each characteristic is either the same across all three cards e.g. [1, 1, 1] or all 
# different e.g. [2, 1, 3])

setCount = 0

def iterateDecks():
    startTime = time.time()
    counter = 10
    matches = buildMatchDictionary()
    with open(f"../../data/{setCount}_set_decks.csv", "w") as file:
        for deck in combinations(range(81), 12):
            # counter-=1
            if counter < 1:
                return
            sets = []
            for cards in combinations(deck, 2):
                matchCard = matches[tuple(cards)]
                if matchCard in deck:
                    validSet = [cards[0], cards[1], matchCard]
                    validSet.sort()
                    if not validSet in sets:
                        sets.append(validSet)
                        if len(sets) > setCount:
                            break
            if len(sets) == setCount:
                counter -= 1
                findTime = time.time()
                print('time to find: {} seconds'.format((findTime - startTime)))
                print(f'{deck},{sets}')
                file.write(f'{deck},{sets}\n')

def buildMatchDictionary():
    matches = {}
    for a in range(81):
        for b in range(a+1, 81):
            c = findThirdCard(a, b)
            matches[(a, b)] = c
    return matches

def findThirdCard(a, b):
    aTern = convertToArray(a)
    bTern = convertToArray(b)
    cTern = [
        ((2*bTern[0] - aTern[0]) % 3),
        ((2*bTern[1] - aTern[1]) % 3),
        ((2*bTern[2] - aTern[2]) % 3),
        ((2*bTern[3] - aTern[3]) % 3),
    ]
    return 27*cTern[0] + 9*cTern[1] + 3*cTern[2] + cTern[3]

def convertToArray(n):
    nTern = []
    for x in range(4):
        n, nVal = divmod(n, 3)
        nTern.insert(0, nVal)
    # print(nTern)
    return nTern

def findSetsInDeck(deck):
    sets = []
    for cards in combinations(deck, 2):
        match = [
        (2* cards[0][0] - cards[1][0])%3,
        (2* cards[0][1] - cards[1][1])%3,
        (2* cards[0][2] - cards[1][2])%3,
        (2* cards[0][3] - cards[1][3])%3
        ]
        if match in deck[deck.index(cards[1]) + 1:]:
            sets.append([cards[0], cards[1], match])
    return sets

def main():
    startTime = time.time()
    iterateDecks()
    endTime = time.time()
    print("Time taken: {} seconds".format((endTime - startTime)))
main()