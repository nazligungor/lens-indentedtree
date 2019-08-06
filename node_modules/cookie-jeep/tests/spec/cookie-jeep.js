describe('Cookie Jeep', function () {

    beforeEach(function() {
        cookies.delete('test_cookie');
    })

    it('the methods should be defined', function () {
        expect(cookies.write).toBeDefined();
        expect(cookies.read).toBeDefined();
        expect(cookies.delete).toBeDefined();
    });

    it('should .write() and .read() cookies', function () {
        cookies.write('test_cookie', 'hello_there');
        var testCookie = cookies.read('test_cookie');
        expect(testCookie).toEqual('hello_there');
    });

    it('should .delete() a cookie', function () {
        cookies.write('test_cookie');
        cookies.delete('test_cookie');
        var testCookie = cookies.read('test_cookie');
        expect(testCookie).toBe(null);
    })
});
