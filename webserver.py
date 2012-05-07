import tornado.ioloop
import tornado.web
import tornado.options

settings = {
  'static_path':'.'
}
application = tornado.web.Application([
], **settings)

if __name__ == "__main__":
  tornado.options.parse_command_line()
  application.listen(8888)
  tornado.ioloop.IOLoop.instance().start()
