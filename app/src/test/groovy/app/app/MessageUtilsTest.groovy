/*
 * This Groovy source file was generated by the Gradle 'init' task.
 */
package app.app

import org.junit.jupiter.api.Test

import static org.junit.jupiter.api.Assertions.assertEquals

class MessageUtilsTest {
    @Test void testGetMessage() {
        assertEquals('Hello      World!', MessageUtils.message)
    }
}
