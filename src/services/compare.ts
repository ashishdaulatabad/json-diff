import { argv0 } from 'process';
import { Field, DiffType, CError, IterableSummary, Type } from '../models/interface';
import { Error, Ok, Result } from '../utils/result';
import Types from '../utils/types';

export default {
    /**
     * @description Compares the two JSON object
     * @todo: To return a promise instead of array of fields
     */
    compare: async function (
        first: any,
        second: any,
    ): Promise<Result<IterableSummary, CError>> {
        return new Promise((resolve) => {
            const [firstType, secondType] = [
                Types.ftype(first),
                Types.ftype(second)
            ]

            /// Normal comparison
            if (firstType === secondType) {
                if (Types.typeIsIterable(firstType) && Types.typeIsIterable(secondType)) {
                    resolve(compareSameIterableType(first, second, [], new Set(), new Set()))
                } else if (Types.typeIsIterable(firstType) || Types.typeIsIterable(secondType)) {
                    const [element, side] = Types.typeIsIterable(firstType) ? 
                        [first, 'left'] : [second, 'right']
                    resolve(constructOneSidedIterableType(element, [], side as ('left' | 'right'), new Set())) 
                }
            } else {
                if (Types.typeIsIterable(firstType) && Types.typeIsIterable(secondType)) {
                    resolve(compareDifferentIterableTypes(first, second, [], new Set(), new Set()))
                } else if (Types.typeIsIterable(firstType) || Types.typeIsIterable(secondType)) {
                    const [element, side] = Types.typeIsIterable(firstType) ? 
                        [first, 'left'] : [second, 'right']
                    resolve(constructOneSidedIterableType(element, [], side as ('left' | 'right'), new Set())) 
                }
            }
        });
    },
}

/**
 * @description Compare two valid arrays.
 * @param first First array
 * @param second Second array
 */
const compareTwoArrays = (
    first: any[],
    second: any[],
    path: Array<string | number> = [],
    leftParentHierarchy: Set<any> = new Set(),
    rightParentHierarchy: Set<any> = new Set(),
): Result<IterableSummary, CError> => {
    let isEquivalent = first.length === second.length
    let [leftonly, rightonly, different, same] = [0, 0, 0, 0]

    const diffSummary: Array<Field> = []
    const minLength = Math.min(first.length, second.length)

    for (let index = 0; index < minLength; ++index) {
        const [firstElement, secondElement] = [first[index], second[index]]

        const [firstType, secondType] = [
            Types.ftype(firstElement),
            Types.ftype(secondElement),
        ]

        if (firstType === secondType) {
            if (!Types.typeIsIterable(firstType)) {
                const diffResult =
                    firstElement === secondElement
                        ? DiffType.Same
                        : DiffType.Different
                different += diffResult === DiffType.Different ? 1 : 0
                same += diffResult === DiffType.Different ? 1 : 0


                diffSummary.push({
                    diffResult,
                    path: path.concat(index),
                    left: firstElement,
                    leftType: firstType,
                    rightType: secondType,
                    right: secondElement,
                    fieldKey: index,
                })

                isEquivalent = isEquivalent && diffResult === DiffType.Same
            } else {
                if (leftParentHierarchy.has(firstElement)) {
                    return Error({
                        error: 'Cycle found inside the first object.',
                    })
                }
                if (rightParentHierarchy.has(secondElement)) {
                    return Error({
                        error: 'Cycle found inside the second object.',
                    })
                }
                leftParentHierarchy.add(firstElement)
                rightParentHierarchy.add(secondElement)

                const value = compareSameIterableType(
                    firstElement,
                    secondElement,
                    path.concat([index]),
                    leftParentHierarchy,
                    rightParentHierarchy,
                )

                // Establish that inner exist
                if (value.ok()) {
                    const inner = value.get() as IterableSummary

                    diffSummary.push({
                        diffResult: inner.isSame ? DiffType.Same : DiffType.Different,
                        fieldKey: index,
                        left: firstElement,
                        leftType: firstType,
                        right: secondElement,
                        rightType: secondType,
                        path: path.concat([index]),
                        children: inner
                    })
                    isEquivalent = isEquivalent && inner.isSame

                    different += inner.different ?? 0
                    same += inner.same ?? 0
                }

                leftParentHierarchy.delete(firstElement)
                rightParentHierarchy.delete(secondElement)
            }
        } else {
            // Types are unequal, so separate them and keep their summary Different
            // which can be handled later
            if (Types.isIterable(firstElement) && Types.isIterable(secondElement)) {
                if (leftParentHierarchy.has(firstElement)) {
                    return Error({
                        error: 'Cycle found in first object.'
                    })
                }
                if (rightParentHierarchy.has(secondElement)) {
                    return Error({
                        error: 'Cycle found in second object'
                    })
                }
                leftParentHierarchy.add(firstElement)
                rightParentHierarchy.add(secondElement)
 
                const inner = compareDifferentIterableTypes(
                    firstElement,
                    secondElement,
                    path.concat([index]),
                    leftParentHierarchy,
                    rightParentHierarchy
                )

                if (inner.ok()) {
                    const children = inner.get() as IterableSummary
                    diffSummary.push({
                        diffResult: children.isSame ? DiffType.Same : DiffType.Different,
                        fieldKey: index,
                        path: path.concat([index]),
                        left: firstElement,
                        leftType: Types.ftype(firstElement),
                        right: secondElement,
                        rightType: Types.ftype(secondElement),
                        children
                    })
                
                    different += children.different ?? 0
                    same += children.same ?? 0
                    
                    isEquivalent = false
                } else {
                    return inner
                }

                leftParentHierarchy.delete(firstElement)
                rightParentHierarchy.delete(secondElement)
            } else if (Types.isIterable(firstElement) || Types.isIterable(secondElement)) {
                const [element, side, parentHierarchy] = Types.isIterable(firstElement) ?
                    [firstElement, 'left', leftParentHierarchy] :
                    [secondElement, 'right', rightParentHierarchy]

                const inner = constructOneSidedIterableType(
                    element,
                    path.concat(index),
                    side as ('left' | 'right'),
                    parentHierarchy
                )

                if (inner.ok()) {
                    const children = inner.get() as IterableSummary

                    diffSummary.push({
                        diffResult: DiffType.Different,
                        path: path.concat([index]),
                        left: firstElement,
                        right: secondElement,
                        leftType: Types.ftype(firstElement),
                        rightType: Types.ftype(secondElement),
                        fieldKey: index,
                        children
                    })
                    different += 1

                    isEquivalent = false
                } else {
                    return inner
                }
            } else {
                diffSummary.push({
                    diffResult: firstElement === secondElement ? DiffType.Same : DiffType.Different,
                    left: firstElement,
                    right: secondElement,
                    leftType: Types.ftype(firstElement),
                    rightType: Types.ftype(secondElement),
                    fieldKey: index,
                    path: path.concat([index])
                })

                different += (firstElement !== secondElement) ? 1 : 0
                same += (firstElement === secondElement) ? 1 : 0
                
                isEquivalent = isEquivalent && firstElement === secondElement
            }
        }
    }

    const [array, side, parentHierarchy] = minLength < first.length ? 
        [first, 'left', leftParentHierarchy] :
        [second, 'right', rightParentHierarchy]

    const diffResult = side === 'left' ? DiffType.LeftOnly : DiffType.RightOnly

    for (let index = minLength; index < array.length; ++index) {
        const element = array[index]
        if (Types.isIterable(element)) {
            if (parentHierarchy.has(element)) {
                return Error({
                    error: 'Cycle found on ' + side + ' side.'
                })
            }

            parentHierarchy.add(element)
            
            const inner = constructOneSidedIterableType(
                element,
                path,
                side as ('left' | 'right'),
                parentHierarchy
            )

            if (inner.ok()) {
                const children = inner.get() as IterableSummary
                diffSummary.push({
                    diffResult,
                    fieldKey: index,
                    ...(diffResult === DiffType.LeftOnly && {left: element, leftType: Types.ftype(element)}),
                    ...(diffResult === DiffType.RightOnly && {right: element, rightType: Types.ftype(element)}),
                    path: path.concat([index]),
                    children
                })
                leftonly += diffResult === DiffType.LeftOnly ? 1 : 0
                rightonly += diffResult === DiffType.RightOnly ? 1 : 0

                isEquivalent = false
            } else {
                return inner
            }
            parentHierarchy.delete(element)
        } else {
            diffSummary.push({
                diffResult,
                fieldKey: index,
                ...(diffResult === DiffType.LeftOnly && {left: element, leftType: Types.ftype(element)}),
                ...(diffResult === DiffType.RightOnly && {right: element, rightType: Types.ftype(element)}),
                path: path.concat([index]),
            })
            leftonly += diffResult === DiffType.LeftOnly ? 1 : 0
            rightonly += diffResult === DiffType.RightOnly ? 1 : 0

            isEquivalent = false;
        }
    }

    return Ok({
        isSame: isEquivalent,
        same,
        different,
        leftonly,
        rightonly,
        summary: diffSummary
    })
}

const compareTwoObjects = (
    first: any,
    second: any,
    path: Array<string | number>,
    leftParentHierarchy: Set<any>,
    rightParentHierarchy: Set<any>,
    assumeEqualInitial: boolean
): Result<IterableSummary, CError> => {
    let isEquivalent = assumeEqualInitial
    const keys = new Set(Object.keys(first).concat(Object.keys(second)))
    const diffSummary: Array<Field> = []
    let [same, different, leftonly, rightonly] = [0, 0, 0, 0]

    for (const key of keys) {
        // Can be same or different
        if (first.hasOwnProperty(key) && second.hasOwnProperty(key)) {
            const firstElement = first[key], secondElement = second[key]
            if (Types.eqType(firstElement, secondElement)) {
                /// Construct type
                if (Types.isIterable(firstElement)) {
                    if (leftParentHierarchy.has(firstElement)) {
                        return Error({ error: 'Cycle found with the first object' })
                    }

                    if (rightParentHierarchy.has(secondElement)) {
                        return Error({ error: 'Cycle found within the second object' })
                    }

                    leftParentHierarchy.add(firstElement)
                    rightParentHierarchy.add(secondElement)

                    const value = compareSameIterableType(
                        firstElement,
                        secondElement,
                        path.concat([key]),
                        leftParentHierarchy,
                        rightParentHierarchy
                    )

                    if (value.ok()) {
                        const inner = value.get() as IterableSummary

                        diffSummary.push({
                            diffResult: inner.isSame ? DiffType.Same : DiffType.Different,
                            left: firstElement,
                            right: secondElement,
                            leftType: Types.ftype(firstElement),
                            rightType: Types.ftype(secondElement), 
                            fieldKey: key,
                            path: path.concat([key]),
                            children: inner
                        })

                        same += inner.isSame ? 1 : 0
                        different += !inner.isSame ? 1 : 0
                        
                        isEquivalent = isEquivalent && inner.isSame

                        leftParentHierarchy.delete(firstElement)
                        rightParentHierarchy.delete(secondElement)
                    } else {
                        return value
                    }
                } else {
                    const compare = firstElement === secondElement
                    diffSummary.push({
                        diffResult: compare ? DiffType.Same : DiffType.Different,
                        left: firstElement,
                        leftType: Types.ftype(firstElement),
                        right: secondElement,
                        rightType: Types.ftype(secondElement),
                        fieldKey: key,
                        path: path.concat([key])
                    })

                    different += !compare ? 1 : 0
                    same += compare ? 1 : 0

                    isEquivalent = isEquivalent && compare
                }
            } else {
                // Types are different
                if (Types.typeIsIterable(firstElement) && Types.typeIsIterable(secondElement)) {                    
                    if (leftParentHierarchy.has(firstElement)) {
                        return Error({ error: 'Cycle found with the first object' })
                    }

                    if (rightParentHierarchy.has(secondElement)) {
                        return Error({ error: 'Cycle found within the second object' })
                    }

                    leftParentHierarchy.add(firstElement)
                    rightParentHierarchy.add(secondElement)
                    const inner = compareDifferentIterableTypes(
                        first,
                        second, 
                        path.concat([key]),
                        leftParentHierarchy,
                        rightParentHierarchy
                    )

                    if (inner.ok()) {
                        const children = inner.get() as IterableSummary
                        diffSummary.push({
                            diffResult: DiffType.Different,
                            path: path.concat([key]),
                            left: firstElement,
                            leftType: Types.ftype(firstElement),
                            right: secondElement,
                            rightType: Types.ftype(secondElement),
                            fieldKey: key,
                            children
                        })

                        different += 1

                        isEquivalent = false
                    } else {
                        return inner
                    }

                    leftParentHierarchy.delete(firstElement)
                    rightParentHierarchy.delete(secondElement)
                } else if (Types.isIterable(firstElement) || Types.isIterable(secondElement)) {
                    const [element, side, parentHierarchy] = Types.isIterable(firstElement) ? 
                        [firstElement, 'left', leftParentHierarchy] : 
                        [secondElement, 'right', rightParentHierarchy];
                    if (parentHierarchy.has(firstElement)) {
                        return Error({ error: 'Cycle found with the first object' })
                    }

                    parentHierarchy.add(firstElement);
                    const inner = constructOneSidedIterableType(
                        element, 
                        path.concat([key]),
                        side as ('left' | 'right'),
                        parentHierarchy
                    )

                    if (inner.ok()) {
                        const children = inner.get() as IterableSummary
                        diffSummary.push({
                            diffResult: DiffType.Different,
                            path: path.concat([key]),
                            left: firstElement,
                            leftType: Types.ftype(firstElement),
                            right: secondElement,
                            rightType: Types.ftype(secondElement),
                            fieldKey: key,
                            children
                        })

                        different += 1
                        isEquivalent = false
                    } else {
                        return inner
                    }

                    leftParentHierarchy.delete(firstElement)
                    rightParentHierarchy.delete(secondElement)
                } else {
                    diffSummary.push({
                        diffResult: DiffType.Different,
                        path: path.concat([key]),
                        left: firstElement,
                        leftType: Types.ftype(firstElement),
                        right: secondElement,
                        rightType: Types.ftype(secondElement),
                        fieldKey: key,
                    })

                    different += 1
                    isEquivalent = false
                }
            }
        } else if (first.hasOwnProperty(key) || second.hasOwnProperty(key)) {
            const element = first.hasOwnProperty(key) ? first[key] : second[key]
            const side = first.hasOwnProperty(key) ? 'left' : 'right'
            if (Types.isIterable(element)) {
                const parentHierarchy = first.hasOwnProperty(key) ?
                    leftParentHierarchy :
                    rightParentHierarchy

                if (parentHierarchy.has(element)) {
                    return Error({
                        error: 'Cycle Found in ' + side + ' side.'
                    })
                }
                parentHierarchy.add(element)
                // console.log(element, Types.is)
                const inner = constructOneSidedIterableType(
                    element,
                    path.concat([key]),
                    side,
                    parentHierarchy
                )
                parentHierarchy.delete(element)

                if (inner.ok()) {
                    const children = inner.get() as IterableSummary;
                    diffSummary.push({
                        diffResult: side === 'left' ? DiffType.LeftOnly : DiffType.RightOnly,
                        fieldKey: key,
                        path: path.concat([key]),
                        ...(side === 'left' && {left: element, leftType: Types.ftype(element)}),
                        ...(side === 'right' && {right: element, rightType: Types.ftype(element)}),
                        children
                    })
                    isEquivalent = false
                } else {
                    return inner
                }
            } else {
                diffSummary.push({
                    diffResult: side === 'left' ? DiffType.LeftOnly : DiffType.RightOnly,
                    fieldKey: key,
                    path: path.concat([key]),
                    ...(side === 'left' && {left: element, leftType: Types.ftype(element)}),
                    ...(side === 'right' && {right: element, rightType: Types.ftype(element)})
                })
                isEquivalent = false
            }
        }
    }

    return Ok({
        isSame: isEquivalent,
        leftonly,
        rightonly,
        same,
        different,
        summary: diffSummary
    })
}

const constructForOneSidedArraysOnly = (
    array: Array<any>,
    path: Array<string | number>,
    side: 'left' | 'right',
    parentHierarchy: Set<any>
): Result<IterableSummary, CError> => {
    const diffSummary: Array<Field> = []
    
    for (let index = 0; index < array.length; ++index) {
        // const type = Types.type(array[index]);
        if (Types.isIterable(array[index])) {
            if (parentHierarchy.has(array[index])) {
                return Error({ error: 'Cycle found in ' + side + ' side.' })
            }

            parentHierarchy.add(array[index])
            const inner = constructOneSidedIterableType(
                array[index],
                path.concat([index]),
                side,
                parentHierarchy
            )
            parentHierarchy.delete(array[index])

            if (inner.ok()) {
                diffSummary.push({
                    diffResult: side === 'left' ? DiffType.LeftOnly : DiffType.RightOnly,
                    ...(side === 'left' && {left: array[index], leftType: Types.ftype(array[index])}),
                    ...(side === 'right' && {right: array[index], rightType: Types.ftype(array[index])}),
                    path: path.concat([index]),
                    fieldKey: index,
                    children: inner.get() as IterableSummary
                })
            } else {
                return inner
            }

        } else {
            diffSummary.push({
                path: path.concat([index]),
                fieldKey: index,
                diffResult: side === 'left' ? DiffType.LeftOnly : DiffType.RightOnly,
                ...(side === 'left' && {left: array[index], leftType: Types.ftype(array[index])}),
                ...(side === 'right' && {right: array[index], rightType: Types.ftype(array[index])}),
            })
        }
    }
    return Ok({
        summary: diffSummary,
        isSame: false
    })
}

const constructForOneSidedObjectOnly = (
    object: any,
    path: Array<string | number>,
    side: 'left' | 'right',
    parentHierarchy: Set<any>
): Result<IterableSummary, CError> => {
    const diffSummary: Array<Field> = []
    let [leftonly, rightonly] = [0, 0]
    const incr = side === 'left' ? 
        (() => (leftonly += 1)) : 
        (() => (rightonly += 1))

    for (const key of Object.keys(object)) {
        // const type = Types.type(array[index]);
        const element = object[key];
        if (Types.isIterable(element)) {
            if (parentHierarchy.has(element)) {
                return Error({ error: 'Cycle found in ' + side + ' side.' })
            }
            parentHierarchy.add(element)
            const inner = constructOneSidedIterableType(element, path.concat([key]), side, parentHierarchy)
            parentHierarchy.delete(element)

            if (inner.ok()) {
                diffSummary.push({
                    diffResult: side === 'left' ? DiffType.LeftOnly : DiffType.RightOnly,
                    ...(side === 'left' && {left: element, leftType: Types.ftype(element)}),
                    ...(side === 'right' && {right: element, rightType: Types.ftype(element)}),
                    path: path.concat([key]),
                    fieldKey: key,
                    children: inner.get() as IterableSummary
                })
                incr()
            } else {
                return inner
            }

        } else {
            diffSummary.push({
                path: path.concat([key]),
                fieldKey: key,
                diffResult: side === 'left' ? DiffType.LeftOnly : DiffType.RightOnly,
                ...(side === 'left' && {left: element, leftType: Types.ftype(element)}),
                ...(side === 'right' && {right: element, rightType: Types.ftype(element)}),
            })
            incr()
        }
    }
    return Ok({
        summary: diffSummary,
        leftonly,
        rightonly,
        isSame: false
    })
} 

const compareDifferentIterableTypes = (
    first: any,
    second: any,
    path: Array<string | number>,
    leftParentHierarchy: Set<any>,
    rightParentHierarchy: Set<any>
): Result<IterableSummary, CError> => {
    // Either way, we can consider them as two objects and
    // call compareTwoObjects
    return compareTwoObjects(first, second, path, leftParentHierarchy, rightParentHierarchy, false)
}

const constructOneSidedIterableType = (
    element: any,
    path: Array<string | number>,
    side: 'left' | 'right',
    parentHierarchy: Set<any>,
): Result<IterableSummary, CError> => {
    switch (Types.ftype(element)) {
        case Type.Object:
            return constructForOneSidedObjectOnly(element, path, side, parentHierarchy)

        case Type.Array:
            return constructForOneSidedArraysOnly(element, path, side, parentHierarchy)

        default:
            return Error({ 
                error: 'Error in detecting proper type of object. Found ' + Types.type(element),
            })
    }
}

const compareSameIterableType = (
    first: any,
    second: any,
    path: Array<string | number>,
    leftParentHierarchy: Set<any>,
    rightParentHierarchy: Set<any>,
): Result<IterableSummary, CError> => {
    switch (Types.ftype(first)) {
        case Type.Object:
            return compareTwoObjects(first, second, path, leftParentHierarchy, rightParentHierarchy, true)

        default:
            return compareTwoArrays(first, second, path, leftParentHierarchy, rightParentHierarchy)
    }
}
